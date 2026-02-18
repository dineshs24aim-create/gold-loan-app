# 📊 Gold Loan Appraiser Tracking System (GLAT)

A professional web application for gold loan appraisers to track their daily appraisals, manage bank branches, and monitor earnings across multiple partner banks.

## ✨ Features

- 🔐 **Secure Authentication** - Email/password authentication with Supabase
- 📈 **Dashboard** - Real-time statistics and AI-powered insights
- 💼 **Loan Management** - Track appraisals with customer details and valuations
- 🏦 **Bank Management** - Manage multiple bank branch relationships
- 📊 **Reports** - Generate daily, monthly, and bank-wise performance reports
- 💰 **Earnings Tracking** - Automatic salary calculations based on appraisal count
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🚀 Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Supabase (PostgreSQL + Authentication)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **AI Insights:** Google Gemini AI

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account ([sign up free](https://supabase.com))
- (Optional) Google Gemini API key for AI insights

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd gold-loan-appraiser-tracking-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [Supabase](https://app.supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the entire content from `supabase-schema.sql` and run it
4. Go to Settings → API and copy your Project URL and anon key

### 4. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your credentials to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key_optional
```

### 5. Run the application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📖 Detailed Setup Guide

For complete Supabase setup instructions, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

## 🎯 Usage

1. **Sign Up** - Create your account with email and password
2. **Add Banks** - Set up the bank branches you work with
3. **Log Appraisals** - Record daily loan appraisals with details
4. **View Dashboard** - Monitor your performance and earnings
5. **Generate Reports** - Export data for record-keeping

## 🏗️ Project Structure

```
├── pages/              # React page components
│   ├── Dashboard.tsx   # Main dashboard with stats
│   ├── Loans.tsx       # Loan appraisal management
│   ├── Banks.tsx       # Bank branch management
│   ├── Reports.tsx     # Reports and exports
│   └── Login.tsx       # Authentication page
├── db.ts              # Database operations
├── supabaseClient.ts  # Supabase client configuration
├── types.ts           # TypeScript type definitions
├── geminiService.ts   # AI insights integration
└── App.tsx            # Main app component with routing
```

## 🔒 Security

- Environment variables are never committed (see `.gitignore`)
- Row Level Security (RLS) enabled on all database tables
- Secure session management via Supabase Auth
- Password requirements: minimum 6 characters

## 📊 Database Schema

The application uses PostgreSQL via Supabase with the following tables:

- **banks** - Bank branch information
- **loans** - Loan appraisal records
- **auth.users** - User authentication (managed by Supabase)

See `supabase-schema.sql` for the complete schema.

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Import your repository in [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Netlify dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♂️ Support

For issues and questions:
- Open an issue in this repository
- Check the [SUPABASE_SETUP.md](SUPABASE_SETUP.md) guide
- Refer to [Supabase Documentation](https://supabase.com/docs)

---

Made with ❤️ for Gold Loan Appraisers
