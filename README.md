# trafcli (Traffic Insight CLI)

Node.js + TypeScript 기반 JSON/NDJSON 트래픽 로그 분석 CLI 입니다. `stats`, `errors`, `qps`, `config` 명령을 제공하며 인터랙티브 설정을 지원합니다.

## 빠른 시작

```bash
npm install -g trafcli
trafcli stats --file sample-logs/traffic-sample.json
```

## 명령어

- `stats`: 총 요청 수, 2xx/4xx/5xx 비율, 평균/최대/P95/P99 지연, 상위 5개 엔드포인트
- `errors`: 4xx/5xx 필터링, 상태코드별 카운트, 최근 n개 샘플(`-n`), 경로/서비스 필터
- `qps`: 1초 단위 집계, 평균/피크 QPS, 서비스/엔드포인트 그룹핑(`--group-by service|path`)
- `config`: 언어(`--lang`), 기본 로그 파일(`--set-file`), 초기화(`--reset`), 출력(`--show`), 인터랙티브 설정(옵션 없음)
- `setting`: Gemini CLI 느낌의 설정 메뉴(언어/기본 파일/리셋/보기). `trafcli`만 입력하면 인터랙티브 모드가 실행되어 메뉴로 이동합니다.

## 개발

```bash
npm install
npm run lint
npm test
npm run build
node dist/index.js stats --file sample-logs/traffic-sample.json
```

## 설정 파일

`~/.trafcli/config.json` 에 언어와 기본 로그 경로가 저장됩니다.

## 라이선스

MIT
