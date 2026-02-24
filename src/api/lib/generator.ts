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
    generateClient: false,
    extractEnums: true,
    extractRequestBody: true,
    enumNamesAsValues: true,
  };

  await generateApi(config);

  const outputFilename = path.resolve(process.cwd(), 'src/api/__generated__/index.ts');

  const generatedDirPath = path.resolve(process.cwd(), 'src/api/__generated__');
  const files = await fs.readdir(generatedDirPath);

  let importUrl = '';
  files.forEach((file: string) => {
    if (file !== 'index.ts' && file.endsWith('.ts')) {
      importUrl += `export * from "./${file.replace('.ts', '.js')}"\n`;
    }
  });

  await fs.writeFile(outputFilename, importUrl);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
