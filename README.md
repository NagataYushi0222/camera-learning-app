# Camera Learning App

カメラと目がどのように像を作るのかを、ノベルゲーム風の学習フローと3D光学シミュレーションで理解するための教育アプリです。

左側の3Dビューで光源・物体・レンズ・ピンホール・スクリーンの位置関係を観察し、右側のセンサー表示で実際に生成された像を確認します。センサー上の1ピクセルをクリックすると、そのピクセルに届いた光や対応する物体点の光束を3Dビュー上で解析できます。

## 技術スタック

### アプリケーション基盤

| 技術 | バージョン | 役割 |
| --- | --- | --- |
| Vite | `^6.0.5` | 開発サーバー、ビルド、React向けの高速な開発環境 |
| TypeScript | `^5.7.2` | 型安全な実装、教材データ・シミュレーションデータの構造化 |
| React | `^18.3.1` | UIコンポーネント、画面状態に応じた描画 |
| React DOM | `^18.3.1` | ブラウザDOMへのReact描画 |

### 3D表示

| 技術 | バージョン | 役割 |
| --- | --- | --- |
| Three.js | `^0.171.0` | 光源、りんご、レンズ、ピンホール、スクリーン、光線、波面などの3D表現 |
| React Three Fiber | `^8.17.10` | Three.jsシーンをReactコンポーネントとして管理 |
| Drei | `^9.122.0` | `OrbitControls`、`Text`、`Line`、`Grid`などの3D補助コンポーネント |

3Dビューでは、レンズは双曲面形状として生成しています。焦点距離と口径から表示用の曲率・中心厚を計算し、焦点距離を短くするとレンズが厚くなるようにしています。センサー画像は同じシミュレーション結果からThree.jsテクスチャとして3D内スクリーンにも貼り付けます。

### センサー描画と光学計算

| 技術 | 役割 |
| --- | --- |
| Canvas 2D | レイトレーシング結果から右側のスクリーン / センサー画像を描画 |
| `ImageData` / pixel buffer | シミュレーション結果をピクセル単位で保持 |
| `THREE.DataTexture` | センサーのpixel bufferを3D空間内スクリーンへ反映 |
| 独自の簡易光学モデル | no-lens、pinhole、lens、out-of-focusの挙動を教育用に計算 |

光学モデルは `src/simulation/opticsModel.ts` に集約しています。完全な波動光学ではなく、学習者が「光が届くこと」と「像になること」の違いを理解できるように、以下を組み合わせています。

- 物体を点群としてサンプリング
- 各サンプル点から複数の光線を生成
- ピンホールでは穴を通る光だけを通過
- レンズでは薄レンズ式 `1/f = 1/do + 1/di` に基づいて理想像面を計算
- センサー位置が理想像面からずれると、同じ物体点からの光が広がりボケる
- センサー画像、3D内スクリーン、クリック解析、ハイライト光線を同じ `sensorResult` から生成

### 状態管理

| 技術 | バージョン | 役割 |
| --- | --- | --- |
| Zustand | `^5.0.2` | シミュレーション状態、レッスン進行、選択ピクセル、表示モードの管理 |

主なstoreは以下です。

- `src/state/useLessonStore.ts`
  - 光学モード
  - 物体・レンズ・スクリーン位置
  - 焦点距離、口径、ピンホール半径
  - センサー表示モード
  - 光線表示モード
  - 選択ピクセルと解析用光線
- `src/state/useScenarioStore.ts`
  - Landing Page / Learning Map / 学習画面の切り替え
  - 現在の章・ステップ
  - 章解放・章完了状態
  - Guided Mode / Explore Mode
  - 進行状況の保存

### UIとデザイン

| 技術 | バージョン | 役割 |
| --- | --- | --- |
| lucide-react | `^0.468.0` | ボタンや操作UIのアイコン |
| CSS | 標準CSS | レイアウト、パネル、ノベルゲーム風ガイド、レスポンシブ調整 |

UIは以下の構成です。

- Landing Page
- Learning Map
- 左側のInteractive 3Dビュー
- 右側のRay-traced Sensorビュー
- 下部のノベルゲーム風Dialogue Box
- 実験パラメータパネル
- 光学デバッグパネル

## コンテンツ構成

教材はReactコンポーネントに長文を直書きせず、`src/content/chapters/` の章データとして管理しています。

```text
src/content/
├─ lessonTypes.ts
└─ chapters/
   ├─ chapter01.ts
   ├─ chapter02.ts
   ├─ ...
   └─ chapter12.ts
```

各章は `Chapter` と `LessonStep` で構成されます。ステップには、本文、話者、選択肢、操作課題、クイズ、まとめ、3Dシーンのプリセット、演出アクションを持たせられます。

対応しているステップ種別:

- `narration`: 通常の説明
- `cinematic`: 3Dシーンやカメラを動かしながら説明
- `choice`: 選択肢による分岐・操作
- `task`: ユーザー操作が完了するまで次へ進めない課題
- `quiz`: 理解確認
- `summary`: 章末まとめ

## 主なディレクトリ

```text
src/
├─ components/
│  ├─ SceneView.tsx
│  └─ SensorPanel.tsx
├─ content/
│  ├─ lessonTypes.ts
│  └─ chapters/
├─ features/
│  ├─ landing/
│  ├─ learning-map/
│  ├─ scenario/
│  ├─ cinematic/
│  └─ save/
├─ simulation/
│  └─ opticsModel.ts
├─ state/
│  ├─ useLessonStore.ts
│  └─ useScenarioStore.ts
└─ styles.css
```

## 開発環境

このプロジェクトはNode.jsとnpmを前提にしています。依存関係は `package.json` と `package-lock.json` で管理します。

## 開発コマンド

```bash
npm install
npm run dev
npm run build
```

### コマンド詳細

| コマンド | 内容 |
| --- | --- |
| `npm install` | 依存パッケージをインストール |
| `npm run dev` | Vite開発サーバーを起動 |
| `npm run build` | TypeScriptのビルドチェック後、Viteで本番ビルド |
| `npm run preview` | ビルド済み成果物をローカルで確認 |

## ビルド成果物

`npm run build` を実行すると、静的ファイルが `dist/` に生成されます。

## 保存機能

学習進行状況は `localStorage` に保存します。保存データには現在の章、現在のステップ、完了済み章、解放済み章、設定情報が含まれます。

関連ファイル:

- `src/features/save/saveProgress.ts`

## 実装方針

- 教材内容はデータ駆動で管理する
- 3D表示、センサー描画、レッスン進行、保存処理を分離する
- 右側センサー表示を装飾ではなく、光線計算結果として扱う
- 1ピクセル解析をコア機能として維持する
- 厳密な物理シミュレーションより、教育的に説明できる単純化を優先する
- 単純化している光学モデルは `docs/simulation/01_OPTICS_MODEL.md` に記録する
