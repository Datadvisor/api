import * as fs from 'fs';

function relativeOrAbsolutePath(relativePath: string, path: string): string {
	if (fs.existsSync(`${relativePath}/${path}`)) {
		return `${relativePath}/${path}`;
	}
	return path;
}

export { relativeOrAbsolutePath };
