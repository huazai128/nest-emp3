import { networkInterfaces } from 'os';

/**
 * 获取服务端IP
 * @export
 * @return {*}
 */
export function getServerIp(): string | undefined {
  const interfaces = networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName] as Array<any>;
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }
}
