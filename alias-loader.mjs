// ESM loader to resolve "@/..." aliases to the project root (current working directory)
// Usage: node --experimental-loader ./alias-loader.mjs app.js
import { pathToFileURL } from 'url';
import path from 'path';

export async function resolve(specifier, context, nextResolve) {
	if (specifier.startsWith('@/')) {
		const projectRoot = process.cwd();
		const absolutePath = path.join(projectRoot, specifier.slice(2));
		const fileUrl = pathToFileURL(absolutePath).href;
		return { url: fileUrl, shortCircuit: true };
	}
	return nextResolve(specifier, context);
}



// // ESM loader to resolve "@/..." aliases to the project root (current working directory)
// // Usage: node --experimental-loader ./alias-loader.mjs app.js
// import { pathToFileURL } from 'url';
// import path from 'path';
// import { promises as fs } from 'fs';

// async function fileExists(filePath) {
// 	try {
// 		await fs.access(filePath);
// 		return true;
// 	} catch {
// 		return false;
// 	}
// }

// export async function resolve(specifier, context, nextResolve) {
// 	if (specifier.startsWith('@/')) {
// 		const projectRoot = process.cwd();
// 		const absoluteBase = path.join(projectRoot, specifier.slice(2));

// 		// If caller provided an extension, try it directly
// 		const hasExtension = path.extname(absoluteBase) !== '';

// 		const candidatePaths = [];
// 		if (hasExtension) {
// 			candidatePaths.push(absoluteBase);
// 		} else {
// 			// Try as a file without extension, then with common extensions
// 			candidatePaths.push(
// 				absoluteBase,
// 				absoluteBase + '.js',
// 				absoluteBase + '.mjs',
// 				absoluteBase + '.json'
// 			);
// 			// Try as a directory with index.* files
// 			candidatePaths.push(
// 				path.join(absoluteBase, 'index.js'),
// 				path.join(absoluteBase, 'index.mjs'),
// 				path.join(absoluteBase, 'index.json')
// 			);
// 		}

// 		for (const candidate of candidatePaths) {
// 			// Convert to file URL only if it exists
// 			// On Windows, ensure proper path normalization
// 			if (await fileExists(candidate)) {
// 				const fileUrl = pathToFileURL(candidate).href;
// 				return { url: fileUrl, shortCircuit: true };
// 			}
// 		}
// 		// Fall back to Node's resolver if none of our candidates matched
// 	}
// 	return nextResolve(specifier, context);
// }


