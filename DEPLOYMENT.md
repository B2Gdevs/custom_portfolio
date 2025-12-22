# Deployment Guide for Vercel

This guide will help you deploy your portfolio to Vercel with the custom domain `bengarrard.com`.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Access to your domain registrar for DNS configuration

## Deployment Steps

### 1. Push Your Code to GitHub

Make sure your code is committed and pushed to your repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com) and sign in
   - Click "Add New..." → "Project"

2. **Import Your Repository**
   - Select your GitHub repository (`portfolio-v2`)
   - Vercel will auto-detect Next.js

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables**
   - No environment variables are required for this project
   - The admin interface is automatically disabled in production

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)

### 3. Add Custom Domain

1. **In Vercel Dashboard**
   - Go to your project → Settings → Domains
   - Click "Add Domain"
   - Enter `bengarrard.com`
   - Click "Add"

2. **Configure DNS**
   - Vercel will provide DNS records to add
   - Typically you'll need to add:
     - **A Record** or **CNAME Record** pointing to Vercel
   - Add the records at your domain registrar (where you bought the domain)
   - DNS propagation can take 24-48 hours, but usually happens within minutes

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates via Let's Encrypt
   - HTTPS will be enabled automatically once DNS propagates

### 4. Verify Deployment

- Visit your Vercel deployment URL (e.g., `portfolio-v2.vercel.app`)
- Once DNS propagates, visit `bengarrard.com`
- Test all pages: home, projects, blog, docs

## Important Notes

### Database
- The SQLite database is **not used in production**
- All content is file-based (MDX files in `/content`)
- Admin interface is automatically disabled in production
- No database setup required on Vercel

### Build Configuration
- The project uses static site generation (SSG)
- All pages are pre-rendered at build time
- No server-side runtime dependencies required

### Custom Domain Setup
If you need to point both `www.bengarrard.com` and `bengarrard.com`:
1. Add both domains in Vercel
2. Configure redirects if needed (Vercel can redirect www to non-www or vice versa)

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript errors are resolved locally first

### Domain Not Working
- Verify DNS records are correct
- Check DNS propagation: [whatsmydns.net](https://www.whatsmydns.net)
- Ensure domain is added in Vercel dashboard
- Wait for SSL certificate provisioning (can take a few minutes)

### Images Not Loading
- Ensure images are in `/public` directory
- Check image paths are correct (should start with `/`)
- Verify Next.js Image component is used correctly

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch automatically triggers a new deployment
- Pull requests get preview deployments
- You can configure branch protection in Vercel settings

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Support: [vercel.com/support](https://vercel.com/support)



