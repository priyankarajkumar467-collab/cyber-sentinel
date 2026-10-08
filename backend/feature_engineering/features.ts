export interface RawTelemetryEvent {
  timestamp?: string;
  source_ip: string;
  destination_ip: string;
  dest_port?: number;
  protocol?: string;
  packet_count?: number;
  byte_count?: number;
  failed_logins?: number;
  conn_duration_sec?: number;
  tcp_flags?: string;
  // Alternative/aggregated fields
  unique_ports?: number;
  connections_count?: number;
  outbound_bytes?: number;
  inbound_bytes?: number;
}

export interface BehavioralFeatures {
  source_ip: string;
  destination_ip: string;
  dest_port: number;
  dest_port_diversity: number;
  conn_rate_per_sec: number;
  failed_login_count: number;
  outbound_mb: number;
  egress_ratio: number;
  is_internal_target: boolean;
  syn_flag_present: boolean;
  duration_sec: number;
  protocol: string;
}

function isPrivateIp(ip: string): boolean {
  if (!ip) return false;
  return (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.3')
  );
}

export function extractFeatures(event: RawTelemetryEvent): BehavioralFeatures {
  const destPort = Number(event.dest_port) || 80;
  const duration = Math.max(0.5, Number(event.conn_duration_sec) || 5.0);
  const packets = Math.max(1, Number(event.packet_count) || Number(event.connections_count) || 10);
  const connRate = parseFloat((packets / duration).toFixed(1));

  // Determine port diversity
  let portDiversity = Number(event.unique_ports) || 1;
  const tcpFlags = (event.tcp_flags || '').toUpperCase();
  const isSynOnly = tcpFlags.includes('SYN') && !tcpFlags.includes('ACK');

  if (isSynOnly && packets > 50 && portDiversity === 1) {
    // If telemetry represents a batch scan session
    portDiversity = Math.min(65535, Math.max(15, Math.round(packets / 8)));
  }

  // Failed logins
  const failedLogins = Math.max(0, Number(event.failed_logins) || 0);

  // Bytes & outbound volume
  const totalBytes = Number(event.byte_count) || Number(event.outbound_bytes) || 5000;
  const outboundBytes = Number(event.outbound_bytes) || totalBytes;
  const inboundBytes = Number(event.inbound_bytes) || Math.max(500, totalBytes * 0.1);
  const outboundMb = parseFloat((outboundBytes / (1024 * 1024)).toFixed(2));
  const egressRatio = Math.min(1.0, outboundBytes / Math.max(1, outboundBytes + inboundBytes));

  const isInternalTarget = isPrivateIp(event.destination_ip);

  return {
    source_ip: event.source_ip || '192.168.1.1',
    destination_ip: event.destination_ip || '10.0.0.1',
    dest_port: destPort,
    dest_port_diversity: portDiversity,
    conn_rate_per_sec: connRate,
    failed_login_count: failedLogins,
    outbound_mb: outboundMb,
    egress_ratio: egressRatio,
    is_internal_target: isInternalTarget,
    syn_flag_present: isSynOnly,
    duration_sec: duration,
    protocol: (event.protocol || 'TCP').toUpperCase(),
  };
}
