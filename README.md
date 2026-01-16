# さめバス予約サービス

デマンド交通予約サービスのWebアプリケーションです。

## 技術スタック

- **フロントエンド**: Vue.js 3 (Composition API)
- **ビルドツール**: Vite 5
- **ルーティング**: Vue Router 4
- **バックエンド**: Firebase Firestore
- **ホスティング**: Firebase Hosting

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Firestoreを有効化
3. `src/firebase/config.js` を編集し、Firebase設定を入力:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 3. 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

### 4. 本番ビルド

```bash
npm run build
```

### 5. Firebase デプロイ

```bash
# Firebase CLIをインストール（初回のみ）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# .firebaserc のプロジェクトIDを更新
# デプロイ
firebase deploy
```

## 画面構成

| No | 画面名 | パス | 説明 |
|----|--------|------|------|
| 1 | ホーム画面 | `/` | 新規予約または予約確認への遷移 |
| 2 | 予約画面 | `/reservation` | 予約情報の入力 |
| 3 | 予約確認画面 | `/reservation/confirm` | 入力内容の確認 |
| 4 | 予約完了画面 | `/reservation/complete` | 予約完了の表示 |
| 5 | 予約履歴一覧画面 | `/history` | 予約履歴の確認 |
| 6 | 運転者ダッシュボード | `/driver` | 運転者向け予約管理 |

## データベース設計

### reservations コレクション

| フィールド | 型 | 説明 |
|-----------|-----|------|
| reservationNumber | string | 予約番号 (表示用) |
| pickupLocation | string | 乗車場所 |
| dropOffLocation | string | 降車場所 |
| reservationDate | string | 予約日 (YYYY-MM-DD) |
| reservationTime | string | 予約時刻 (HH:mm) |
| customerName | string | 利用者名 |
| customerPhone | string | 電話番号 |
| status | string | ステータス (pending/in_progress/completed/cancelled) |
| createdAt | timestamp | 作成日時 |
| updatedAt | timestamp | 更新日時 |

## プロジェクト構成

```
├── src/
│   ├── main.js                 # アプリケーションエントリー
│   ├── App.vue                 # ルートコンポーネント
│   ├── style.css               # グローバルスタイル
│   ├── router/
│   │   └── index.js            # ルーティング設定
│   ├── firebase/
│   │   └── config.js           # Firebase初期化
│   ├── composables/
│   │   └── useReservations.js  # 予約データ管理
│   └── views/
│       ├── HomeView.vue
│       ├── ReservationFormView.vue
│       ├── ReservationConfirmView.vue
│       ├── ReservationCompleteView.vue
│       ├── ReservationHistoryView.vue
│       └── DriverDashboardView.vue
├── index.html
├── package.json
├── vite.config.js
├── firebase.json
├── firestore.rules
└── .firebaserc
```

## 注意事項

- 認証機能は実装されていません。URLを知っていれば誰でもアクセス可能です。
- 本番運用時は適切なセキュリティ対策を検討してください。
- Firestore無料枠: 読み取り50,000/日、書き込み20,000/日


