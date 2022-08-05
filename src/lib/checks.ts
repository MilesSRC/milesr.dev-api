import { execSync } from "node:child_process";

export function isProduction(): boolean {
    /* Check if system is running linux based distro OR project is not in development environment */
    return process.platform === 'linux' || process.env.NODE_ENV !== 'dev';
}

/* Check if PM2 using exec says that a process with the name of "milesr.dev" is running */
export function isSitePresent(): boolean {
    /* Ensure PM2 is installed */
    if(!isProduction()) return false;

    /* Check if PM2 is installed */
    try {
        execSync('pm2 --version');
    } catch(e) {
        return false;
    }

    /* Get list */
    let list = JSON.parse(execSync('pm2 jlist').toString());

    return list.find((process: { name: string }) => process.name === 'milesr.dev-ver2') !== undefined;
}