import fs from 'fs/promises';
import path from 'path';
import { generateApi, GenerateApiParams } from 'swagger-typescript-api';

async function main() {
  const config: GenerateApiParams = {
    url: 'http://localhost:8080/openapi',
    output: path.resolve(process.cwd(), 'src/api/__generated__'),
    modular: true,
    generateRouteTypes: false,
    generateUnionEnums: true,
    generateClient: true,
    extractEnums: true,
    extractRequestBody: true,
    enumNamesAsValues: true,
  };

  await generateApi(config);

  const outputFilename = path.resolve(process.cwd(), 'src/api/__generated__/index.ts');

  const generatedDirPath = path.resolve(process.cwd(), 'src/api/__generated__');
  const files = await fs.readdir(generatedDirPath);

  const importUrl = files
    .filter((file: string) => file !== 'index.ts' && file.endsWith('.ts'))
    .map((file: string) => `export * from "./${file.replace('.ts', '.js')}"`)
    .join('\n');

  await fs.writeFile(outputFilename, importUrl ? importUrl + '\n' : '');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
