# Juby Product Brief

## Executive Summary

**Product Name:** Juby
**Tagline:** La app de ahorro para tu retiro en Latinoamérica: estable, segura y con interés compuesto.
**Product Type:** Retirement Savings Mobile/Web Application
**Target Market:** Latin America
**Stage:** Early Development

## Product Vision & Mission

### Vision
Democratize retirement savings in Latin America by providing a stable, secure, and accessible platform that leverages compound interest to help millions of workers build financial security for their future.

### Mission
Empower Latin American workers to take control of their retirement through an intuitive, trustworthy digital platform that makes long-term savings simple, transparent, and rewarding.

### Core Value Proposition
- **Estable (Stable):** Reliable investment vehicles backed by secure financial instruments
- **Segura (Secure):** Bank-level security and regulatory compliance protecting user assets
- **Interés Compuesto (Compound Interest):** Maximizing returns through the power of compound growth over time

## Market Context

### Problem Statement
Approximately 130 million workers in Latin America are not saving for retirement. The region faces:
- Low pension coverage and inadequate traditional retirement systems
- Limited financial literacy around long-term savings
- Distrust in traditional financial institutions
- Lack of accessible, user-friendly digital retirement solutions
- Economic instability and inflation concerns
- Fragmented retirement regulations across countries

### Target Users

#### Primary Personas

**Persona 1: Young Professional (25-35)**
- Early career, stable income
- Tech-savvy, mobile-first
- Limited retirement savings knowledge
- Seeking simple, automated solutions
- Concerned about inflation and currency devaluation

**Persona 2: Mid-Career Worker (36-50)**
- Established career, higher income
- Some retirement awareness, but behind on savings
- Balancing multiple financial priorities
- Values security and transparency
- May have existing retirement accounts

**Persona 3: Informal Sector Worker (25-55)**
- No employer-sponsored retirement plan
- Irregular income
- Limited access to traditional financial services
- Needs flexible contribution options
- High mobile penetration

### Geographic Focus
Primary: Mexico, Colombia, Chile, Brazil, Argentina, Peru
- Each market has unique regulatory requirements
- Different currency considerations
- Varying levels of financial infrastructure

## Product Features & Functionality

### Core Features (MVP)

#### Account Management
- Simple onboarding with KYC compliance
- Multiple funding sources (bank transfer, debit card, payroll deduction)
- Flexible contribution schedules (monthly, biweekly, ad-hoc)
- Low minimum investment thresholds

#### Investment Engine
- Diversified portfolio options (conservative, moderate, aggressive)
- Age-based automatic rebalancing
- Stable investment vehicles (government bonds, stable currencies, fixed income)
- Transparent fee structure

#### Compound Interest Visualization
- Interactive calculators showing growth projections
- Real-time portfolio value tracking
- Historical performance data
- Retirement goal planning tools

#### Security & Trust
- Bank-level encryption
- Two-factor authentication
- Regulatory compliance (per country)
- Insurance on deposits (where applicable)
- Transparent audit trail

#### User Experience
- Mobile-first design (iOS and Android)
- Web dashboard for detailed analysis
- Spanish and Portuguese language support
- Educational content about retirement planning
- Push notifications for contributions and milestones

### Future Features (Post-MVP)

- Tax optimization strategies
- Early withdrawal options (with penalties)
- Beneficiary management
- Social features (community, challenges)
- AI-powered financial advisor
- Cross-border portability
- Integration with existing pension systems
- Crypto-backed stable savings options

## Technical Architecture

### Frontend Stack
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Component System:** shadcn/ui (for consistent, accessible components)
- **Language:** TypeScript (strict mode)
- **State Management:** TBD (React Context, Zustand, or Redux Toolkit)

### Key Architecture Decisions

#### Server-Side Rendering (SSR)
- Improved SEO for marketing pages
- Faster initial page loads
- Better performance on lower-end devices common in Latin America

#### Progressive Web App (PWA)
- Offline-first capabilities
- App-like experience without app store friction
- Reduced data usage (important for emerging markets)

#### Performance Optimization
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- CDN delivery for static assets
- Minimal JavaScript bundles

#### Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode support

### Backend Considerations (To Be Defined)
- API architecture (REST or GraphQL)
- Authentication/Authorization (JWT, OAuth)
- Database (PostgreSQL, MongoDB)
- Payment processing integration
- Regulatory compliance APIs
- Real-time data synchronization
- Multi-currency support
- Notification service

### Security Requirements
- End-to-end encryption for sensitive data
- PCI DSS compliance for payment handling
- Regular security audits
- GDPR/local privacy law compliance
- Secure session management
- Rate limiting and DDoS protection

### Third-Party Integrations
- Banking APIs (Open Banking where available)
- Payment gateways (Stripe, local processors)
- KYC/AML verification services
- Investment/brokerage APIs
- SMS/Email notification services
- Analytics and monitoring (Vercel Analytics, Sentry)

## Design Principles

### Visual Design
- **Clean & Trustworthy:** Professional appearance that builds confidence
- **Accessible:** High contrast, readable fonts (Geist font family), clear hierarchy
- **Responsive:** Mobile-first with seamless desktop experience
- **Culturally Relevant:** Localized imagery and content for Latin American markets

### UX Principles
- **Simplicity First:** Complex financial concepts presented simply
- **Transparency:** No hidden fees, clear explanations
- **Progressive Disclosure:** Show basic info upfront, details on demand
- **Positive Reinforcement:** Celebrate savings milestones
- **Education:** In-context learning about retirement planning

### Color Palette
- Primary: Trust-building blues/greens (to be defined)
- Secondary: Warm accent colors for CTAs
- Neutral: Zinc palette (current) for backgrounds and text
- Dark mode support for user preference

### Accessibility Standards
- Minimum font size: 16px
- Touch targets: 44x44px minimum
- Color contrast: 4.5:1 for text, 3:1 for UI components
- Form validation with clear error messages
- Loading states and skeleton screens

## Business Model

### Revenue Streams
1. **Management Fees:** Small percentage of assets under management (AUM)
2. **Performance Fees:** Success-based fees on investment returns (optional)
3. **Premium Features:** Advanced tools, personalized advice (freemium model)
4. **Partner Referrals:** Financial product recommendations

### Pricing Strategy
- Transparent, low-fee structure
- Competitive with traditional Afores/pension systems
- Volume-based discounts for larger balances
- No hidden charges or commissions

### Growth Metrics
- User acquisition cost (CAC)
- Customer lifetime value (LTV)
- Assets under management (AUM)
- Monthly active users (MAU)
- Retention rate
- Average contribution amount
- Time to first contribution
- Net Promoter Score (NPS)

## Regulatory Compliance

### Key Considerations by Market
- **Mexico:** CONSAR (Comisión Nacional del Sistema de Ahorro para el Retiro)
- **Colombia:** Superintendencia Financiera
- **Chile:** Superintendencia de Pensiones
- **Brazil:** PREVIC, CVM regulations
- **Argentina:** ANSES, local pension regulations

### Compliance Requirements
- KYC (Know Your Customer) verification
- AML (Anti-Money Laundering) monitoring
- Data privacy (local equivalents to GDPR)
- Financial licensing per jurisdiction
- Regular audits and reporting
- Consumer protection regulations

## Competitive Landscape

### Direct Competitors
- Traditional Afores (Mexico)
- Pension fund administrators (AFP) in Chile, Peru, Colombia
- Emerging fintech retirement solutions in LATAM

### Indirect Competitors
- General investment apps (Fintual, GBM+, Nu Invest)
- Neobanks with savings features
- Cryptocurrency savings platforms
- Traditional banks with retirement products

### Competitive Advantages
- Mobile-first, modern UX
- Lower fees than traditional providers
- Educational focus
- Transparency and trust
- Compound interest visualization
- Flexibility for informal workers

## Success Criteria

### Phase 1 (MVP Launch - Months 1-6)
- 1,000+ registered users
- $100K+ in assets under management
- <5% user churn rate
- 4+ star rating on app stores
- Regulatory approval in first market

### Phase 2 (Growth - Months 6-12)
- 10,000+ active users
- $1M+ in AUM
- Expansion to 2nd country
- <10% customer acquisition cost growth
- Profitable unit economics

### Phase 3 (Scale - Year 2+)
- 100,000+ users
- $10M+ in AUM
- 3+ markets operational
- Strategic partnerships with employers
- Series A funding (if applicable)

## Development Priorities

### Must Have (P0)
1. User registration and KYC
2. Bank account linking
3. Contribution scheduling
4. Basic investment allocation
5. Portfolio dashboard
6. Security and compliance

### Should Have (P1)
1. Retirement calculator
2. Goal setting features
3. Educational content
4. Email notifications
5. Multi-currency support

### Nice to Have (P2)
1. Social features
2. Gamification elements
3. Advanced analytics
4. AI recommendations
5. Tax optimization

## Open Questions & Decisions Needed

1. Which country to launch first?
2. What investment vehicles to offer initially?
3. Build vs. buy for investment backend?
4. Mobile app (native) vs. PWA strategy?
5. B2C only or B2B2C (employer partnerships)?
6. Specific regulatory partners/advisors per market?
7. Target launch date for MVP?
8. Funding strategy and runway?

## References & Resources

- Company LinkedIn: https://www.linkedin.com/company/juby/
- IDB Report on LATAM Retirement: 130M workers without retirement savings
- Brookings Research: Pension system challenges in Latin America
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS v4: https://tailwindcss.com/

---

**Document Version:** 1.0
**Last Updated:** 2025-11-20
**Status:** Draft - Requires validation and input from product/business teams