import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { PrismaClient } from '@prisma/client';

interface Character {
    code: string;
    name: string;
    speed: number;
    defaultSkinCode: string;
}

interface Skin {
    code: string;
    name: string;
}

const prismaClient = new PrismaClient();

async function parseCSV<T>(
    filePath: string,
    castFunction?: (value: string, context: any) => any
): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const results: T[] = [];

        fs.createReadStream(path.resolve(filePath))
            .pipe(parse({
                columns: true,
                skip_empty_lines: true,
                cast: castFunction
            }))
            .on('data', (data) => results.push(data as T))
            .on('error', reject)
            .on('end', () => resolve(results));
    });
}

async function importSkins(filePath: string) {
    try {
        const skins = await parseCSV<Skin>(filePath);
        for (const skin of skins) {
            await prismaClient.skin.upsert({
                where: {
                    code: skin.code
                },
                update: {
                    code: skin.code,
                    name: skin.name,
                },
                create: {
                    code: skin.code,
                    name: skin.name,
                }
            });
        }
    } catch (error) {
        throw error;
    }
}

async function importCharacters(filePath: string): Promise<void> {
    try {
        const characterCastFunction = (value: string, context: any) => {
            if (context.column === 'speed') {
                return parseFloat(value);
            }
            return value;
        };
        
        const characters = await parseCSV<Character>(filePath, characterCastFunction);
        for (const character of characters) {
            await prismaClient.character.upsert({
                where: { code: character.code },
                update: {
                    code: character.code,
                    name: character.name,
                    speed: character.speed,
                    defaultSkinCode: character.defaultSkinCode,
                },
                create: {
                    code: character.code,
                    name: character.name,
                    speed: character.speed,
                    defaultSkinCode: character.defaultSkinCode,
                }
            });
        }
    } catch (error) {
        throw error;
    }
}

async function main() {
  console.log('🌱 Starting seed...');
    try {
        const tableDir = path.resolve(process.cwd(), 'tables');
        const skinPath = path.join(tableDir, 'Skin.csv');
        const characterPath = path.join(tableDir, 'Character.csv');

        await importSkins(skinPath);
        await importCharacters(characterPath);

        console.log('✅ Seed complete!');
    } catch (error) {
        throw error;
    }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
