import fs from 'node:fs';
import path from 'node:path';

export interface ProjectFile {
  path: string; // Relative path, e.g. "src/App.tsx"
  content: string;
}

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.cache',
  '__pycache__',
  '.vscode',
  '.idea',
  'coverage',
]);

const IGNORED_FILES = new Set([
  '.DS_Store',
  'Thumbs.db',
  'sentinel.sqlite',
  'sentinel.sqlite-journal',
]);

export function collectProjectFiles(rootDir: string = process.cwd()): ProjectFile[] {
  const files: ProjectFile[] = [];

  function traverse(currentDir: string, relativePrefix: string = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const name = entry.name;
      const relPath = relativePrefix ? `${relativePrefix}/${name}` : name;
      const fullPath = path.join(currentDir, name);

      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(name) || (name.startsWith('.') && name !== '.github')) {
          continue;
        }
        traverse(fullPath, relPath);
      } else if (entry.isFile()) {
        // Exclude secrets, sqlite databases, logs, locks
        if (
          IGNORED_FILES.has(name) ||
          (name.startsWith('.env') && name !== '.env.example') ||
          name.endsWith('.sqlite') ||
          name.endsWith('.sqlite3') ||
          name.endsWith('.db') ||
          name.endsWith('.log')
        ) {
          continue;
        }

        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          files.push({
            path: relPath.replace(/\\/g, '/'),
            content,
          });
        } catch (e) {
          console.warn(`Could not read file ${fullPath}:`, e);
        }
      }
    }
  }

  traverse(rootDir);
  return files;
}

export function collectDistFiles(distDir = path.resolve(process.cwd(), 'dist')): ProjectFile[] {
  if (!fs.existsSync(distDir)) return [];
  const files: ProjectFile[] = [];

  function traverse(currentDir: string, relativePrefix: string = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath, relPath);
      } else if (entry.isFile()) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          files.push({
            path: relPath.replace(/\\/g, '/'),
            content,
          });
        } catch (e) {
          // ignore
        }
      }
    }
  }

  traverse(distDir);
  return files;
}

export interface GitHubPushOptions {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
  isNewRepo?: boolean;
  isPrivate?: boolean;
  commitMessage?: string;
}

export interface GitHubPushResult {
  success: boolean;
  repo_name: string;
  owner: string;
  branch: string;
  commit_sha: string;
  commit_message: string;
  repo_url: string;
  files_count: number;
}

export async function pushToGitHub(
  options: GitHubPushOptions,
  onProgress?: (step: string) => void
): Promise<GitHubPushResult> {
  const {
    token,
    owner,
    repo,
    branch = 'main',
    isNewRepo = false,
    isPrivate = false,
    commitMessage = 'Initial commit: CYBER SENTINEL Intelligent Cyber Threat Detection',
  } = options;

  if (!token || !token.trim()) {
    throw new Error('GitHub Personal Access Token is required.');
  }
  if (!owner || !owner.trim()) {
    throw new Error('GitHub username or organization is required.');
  }
  if (!repo || !repo.trim()) {
    throw new Error('Repository name is required.');
  }

  const cleanToken = token.trim();
  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const cleanBranch = branch.trim() || 'main';

  const headers = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Cyber-Sentinel-App',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // 1. Preparing files
  onProgress?.('Preparing files');
  const projectFiles = collectProjectFiles();
  if (projectFiles.length === 0) {
    throw new Error('No exportable files found in project.');
  }

  // 2. Connecting to GitHub & Authenticating
  onProgress?.('Connecting to GitHub');
  const userRes = await fetch('https://api.github.com/user', { headers });
  if (!userRes.ok) {
    if (userRes.status === 401) {
      throw new Error('Invalid GitHub token. Please check your Personal Access Token permissions.');
    }
    const errText = await userRes.text();
    throw new Error(`GitHub authentication failed: ${errText}`);
  }
  const authUser = await userRes.json();
  const isOrg = authUser.login.toLowerCase() !== cleanOwner.toLowerCase();

  // 3. Creating repository if required
  onProgress?.('Checking repository');
  let repoExists = false;
  const checkRepoRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, { headers });
  if (checkRepoRes.ok) {
    repoExists = true;
  }

  if (!repoExists && isNewRepo) {
    onProgress?.('Creating repository');
    const createUrl = isOrg
      ? `https://api.github.com/orgs/${cleanOwner}/repos`
      : 'https://api.github.com/user/repos';

    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: cleanRepo,
        description: 'CYBER SENTINEL - Intelligent Cyber Threat & Network Anomaly Detection',
        private: isPrivate,
        auto_init: true, // create an initial commit with README so a default branch exists
      }),
    });

    if (!createRes.ok) {
      const errJson = await createRes.json().catch(() => ({}));
      throw new Error(
        `Failed to create repository: ${errJson.message || createRes.statusText}`
      );
    }

    // Wait 2 seconds for GitHub to initialize repository backend
    await new Promise((r) => setTimeout(r, 2000));
  } else if (!repoExists && !isNewRepo) {
    throw new Error(
      `Repository '${cleanOwner}/${cleanRepo}' does not exist on GitHub. Choose 'Create a new repository' or check the repository name.`
    );
  }

  // 4. Get current commit on branch
  onProgress?.('Connecting to branch');
  let latestCommitSha: string | null = null;
  let baseTreeSha: string | null = null;

  const branchRefRes = await fetch(
    `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/ref/heads/${cleanBranch}`,
    { headers }
  );

  if (branchRefRes.ok) {
    const refData = await branchRefRes.json();
    latestCommitSha = refData.object.sha;

    // Fetch commit to get base tree
    const commitRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/commits/${latestCommitSha}`,
      { headers }
    );
    if (commitRes.ok) {
      const commitData = await commitRes.json();
      baseTreeSha = commitData.tree.sha;
    }
  } else {
    // If branch doesn't exist, check default branch
    const repoInfoRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, { headers });
    if (repoInfoRes.ok) {
      const repoInfo = await repoInfoRes.json();
      const defaultBranch = repoInfo.default_branch || 'main';
      const defaultRefRes = await fetch(
        `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/ref/heads/${defaultBranch}`,
        { headers }
      );
      if (defaultRefRes.ok) {
        const defaultRefData = await defaultRefRes.json();
        latestCommitSha = defaultRefData.object.sha;
      }
    }
  }

  // 5. Upload files into Git tree
  onProgress?.(`Uploading ${projectFiles.length} project files`);
  const treeItems = projectFiles.map((file) => ({
    path: file.path,
    mode: '100644',
    type: 'blob',
    content: file.content,
  }));

  const treePayload: any = {
    tree: treeItems,
  };
  if (baseTreeSha) {
    treePayload.base_tree = baseTreeSha;
  }

  const treeRes = await fetch(
    `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/trees`,
    {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(treePayload),
    }
  );

  if (!treeRes.ok) {
    const treeErr = await treeRes.json().catch(() => ({}));
    throw new Error(`Failed to create Git tree: ${treeErr.message || treeRes.statusText}`);
  }
  const treeData = await treeRes.json();
  const newTreeSha = treeData.sha;

  // 6. Committing changes
  onProgress?.('Committing changes');
  const commitPayload: any = {
    message: commitMessage,
    tree: newTreeSha,
    parents: latestCommitSha ? [latestCommitSha] : [],
  };

  const newCommitRes = await fetch(
    `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/commits`,
    {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(commitPayload),
    }
  );

  if (!newCommitRes.ok) {
    const commitErr = await newCommitRes.json().catch(() => ({}));
    throw new Error(`Failed to create commit: ${commitErr.message || newCommitRes.statusText}`);
  }
  const newCommitData = await newCommitRes.json();
  const newCommitSha = newCommitData.sha;

  // 7. Update branch reference / Push completed
  onProgress?.('Updating branch reference');
  if (branchRefRes.ok) {
    // Update existing branch ref
    const updateRefRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs/heads/${cleanBranch}`,
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sha: newCommitSha,
          force: true,
        }),
      }
    );
    if (!updateRefRes.ok) {
      const refErr = await updateRefRes.json().catch(() => ({}));
      throw new Error(`Failed to update branch reference: ${refErr.message || updateRefRes.statusText}`);
    }
  } else {
    // Create new branch ref
    const createRefRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs`,
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: `refs/heads/${cleanBranch}`,
          sha: newCommitSha,
        }),
      }
    );
    if (!createRefRes.ok) {
      const refErr = await createRefRes.json().catch(() => ({}));
      throw new Error(`Failed to create branch reference: ${refErr.message || createRefRes.statusText}`);
    }
  }

  // Also publish production bundle to gh-pages branch if dist exists
  try {
    const distFiles = collectDistFiles();
    if (distFiles.length > 0) {
      onProgress?.('Publishing production bundle to gh-pages');
      const distTreeItems = distFiles.map((file) => ({
        path: file.path,
        mode: '100644',
        type: 'blob',
        content: file.content,
      }));

      const distTreeRes = await fetch(
        `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/trees`,
        {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ tree: distTreeItems }),
        }
      );

      if (distTreeRes.ok) {
        const distTreeData = await distTreeRes.json();
        const distCommitRes = await fetch(
          `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/commits`,
          {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'Deploy Cyber Sentinel production bundle to GitHub Pages',
              tree: distTreeData.sha,
              parents: [],
            }),
          }
        );

        if (distCommitRes.ok) {
          const distCommitData = await distCommitRes.json();
          const ghPagesRefRes = await fetch(
            `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/ref/heads/gh-pages`,
            { headers }
          );

          if (ghPagesRefRes.ok) {
            await fetch(
              `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs/heads/gh-pages`,
              {
                method: 'PATCH',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ sha: distCommitData.sha, force: true }),
              }
            );
          } else {
            await fetch(
              `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs`,
              {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ref: 'refs/heads/gh-pages',
                  sha: distCommitData.sha,
                }),
              }
            );
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not auto-publish to gh-pages branch:', err);
  }

  onProgress?.('Push completed');

  return {
    success: true,
    repo_name: cleanRepo,
    owner: cleanOwner,
    branch: cleanBranch,
    commit_sha: newCommitSha.slice(0, 7),
    commit_message: commitMessage,
    repo_url: `https://github.com/${cleanOwner}/${cleanRepo}`,
    files_count: projectFiles.length,
  };
}
