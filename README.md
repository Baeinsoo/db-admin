# db-admin

## 환경 설정
프로젝트 루트에 `.env` 파일을 생성하세요. 예시:

```
DATABASE_URL="postgresql://postgres:testpw@localhost:6432/postgres?schema=public"
```

## 설치
```
npm install
```

## Prisma
- 클라이언트 생성
```
npx prisma generate
```

- 스키마를 DB에 적용(개발용 마이그레이션)
```
npx prisma migrate dev --name init
```

실행 시 `migrations/` 폴더가 생성되며, 데이터베이스가 `prisma/schema.prisma`와 동기화됩니다.

## 시드 데이터
`tables/` 디렉토리의 CSV 파일에서 캐릭터와 스킨 데이터를 주입합니다.

- CSV 파일
	- `tables/Skin.csv`
	- `tables/Character.csv`

시드 스크립트는 dotenv로 환경 변수를 로드하고, 프로젝트 루트 기준으로 CSV 경로를 해석합니다.

실행:
```
npm run seed
```

출력 예시:
```
🌱 Starting seed...
✅ Seed complete!
```