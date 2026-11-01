# Design Document - CryptoConnect

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Application                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Presentation│  │   Business  │  │  Data & Storage     │ │
│  │    Layer    │  │    Logic    │  │      Layer          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/TLS 1.3
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ API Gateway  │  │ Auth Service │  │ Notification Svc │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data & Services Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │  File Storage    │  │
│  │   Database   │  │    Cache     │  │   (AWS S3)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Email      │  │  Identity    │  │  Push Notif      │  │
│  │   Service    │  │ Verification │  │ (FCM/APNS)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

**Mobile Application:**
- **Framework**: React Native (cross-platform iOS/Android)
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation v6
- **UI Components**: React Native Paper + Custom Components
- **Networking**: Axios with interceptors
- **Local Storage**: AsyncStorage (encrypted)
- **Offline Support**: Redux Persist + Custom Cache Manager
- **Internationalization**: i18next
- **Push Notifications**: React Native Firebase (FCM + APNS)
- **Security**: react-native-keychain, crypto-js

**Backend API:**
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi
- **API Documentation**: Swagger/OpenAPI

**Database & Storage:**
- **Primary Database**: PostgreSQL 14+
- **Cache Layer**: Redis 7+
- **File Storage**: AWS S3 or compatible
- **Search Engine**: Elasticsearch (optional, for content search)

**DevOps & Infrastructure:**
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (error tracking)
- **Analytics**: Firebase Analytics

## 2. Data Models

### 2.1 User Model

```typescript
interface User {
  id: string; // UUID
  email: string; // max 254 chars, unique
  passwordHash: string; // bcrypt hashed
  name: string | null; // max 100 chars
  phoneNumber: string | null; // max 20 chars
  languagePreference: 'fr' | 'en';
  emailVerified: boolean;
  emailVerificationToken: string | null;
  identityVerificationStatus: 'not_started' | 'pending' | 'verified' | 'rejected';
  identityVerificationRejectionReason: string | null;
  accountStatus: 'active' | 'locked';
  loginAttempts: number;
  lastLoginAttemptAt: Date | null;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}
```

### 2.2 Service Model

```typescript
interface Service {
  id: string; // UUID
  name: string; // Service name
  summary: string; // max 100 chars
  description: string; // Full description
  benefits: string[]; // Array of benefit statements
  accessSteps: string[]; // Ordered array of steps
  requiresIdentityVerification: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.3 Learning Content Model

```typescript
interface LearningContent {
  id: string; // UUID
  title: string; // max 200 chars
  slug: string; // URL-friendly
  contentType: 'article' | 'tutorial' | 'glossary';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  body: string; // Markdown or HTML
  excerpt: string; // max 300 chars
  coverImageUrl: string | null;
  tags: string[]; // For search
  viewCount: number;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.4 Request Model

```typescript
interface Request {
  id: string; // UUID
  userId: string; // Foreign key to User
  requestType: 'contact_form' | 'service_inquiry' | 'support';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  name: string; // max 100 chars
  email: string; // max 254 chars
  subject: string; // max 200 chars
  message: string; // max 2000 chars
  attachedDocuments: string[]; // Array of S3 URLs
  statusHistory: StatusChange[];
  assignedTo: string | null;
  responseMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface StatusChange {
  status: string;
  timestamp: Date;
  note: string | null;
}
```

### 2.5 Identity Verification Model

```typescript
interface IdentityVerification {
  id: string; // UUID
  userId: string; // Foreign key to User
  documentType: 'national_id' | 'passport' | 'driver_license';
  documentFrontUrl: string; // S3 URL (encrypted)
  documentBackUrl: string | null; // S3 URL (encrypted)
  status: 'not_started' | 'pending' | 'verified' | 'rejected';
  rejectionReason: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.6 Notification Settings Model

```typescript
interface NotificationSettings {
  id: string; // UUID
  userId: string; // Foreign key to User
  requestUpdatesEnabled: boolean;
  learningContentEnabled: boolean;
  identityVerificationEnabled: boolean;
  pushToken: string | null; // FCM/APNS token
  platform: 'ios' | 'android';
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.7 Company Info Model

```typescript
interface CompanyInfo {
  id: string; // UUID
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  workingHours: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  updatedAt: Date;
}
```

## 3. API Specification

### 3.1 Authentication Endpoints

#### POST /api/auth/register
```typescript
Request Body:
{
  email: string;
  password: string;
}

Response 201:
{
  message: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  }
}

Errors:
- 400: Invalid email format or password requirements
- 409: Email already exists
- 500: Email sending failure
```

#### POST /api/auth/login
```typescript
Request Body:
{
  email: string;
  password: string;
}

Response 200:
{
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

Errors:
- 401: Invalid credentials
- 403: Account locked or email not verified
- 429: Too many login attempts
```

#### POST /api/auth/verify-email
```typescript
Request Body:
{
  token: string;
}

Response 200:
{
  message: string;
}

Errors:
- 400: Invalid or expired token
```

#### POST /api/auth/refresh
```typescript
Request Body:
{
  refreshToken: string;
}

Response 200:
{
  accessToken: string;
}

Errors:
- 401: Invalid or expired refresh token
```

### 3.2 Service Catalog Endpoints

#### GET /api/services
```typescript
Response 200:
{
  services: Service[];
}

Errors:
- 500: Failed to load services
```

#### GET /api/services/:id
```typescript
Response 200:
{
  service: Service;
}

Errors:
- 404: Service not found
```

### 3.3 Learning Content Endpoints

#### GET /api/content
```typescript
Query Parameters:
- difficultyLevel?: 'beginner' | 'intermediate' | 'advanced'
- contentType?: 'article' | 'tutorial' | 'glossary'
- limit?: number (default 20)
- offset?: number (default 0)

Response 200:
{
  content: LearningContent[];
  total: number;
  hasMore: boolean;
}
```

#### GET /api/content/:id
```typescript
Response 200:
{
  content: LearningContent;
}

Errors:
- 404: Content not found
```

#### GET /api/content/search
```typescript
Query Parameters:
- query: string (1-200 chars)

Response 200:
{
  results: LearningContent[];
  total: number;
}

Errors:
- 400: Invalid query length
```

### 3.4 Contact Endpoints

#### POST /api/contact
```typescript
Request Body:
{
  name: string; // max 100
  email: string; // max 254
  subject: string; // max 200
  message: string; // max 2000
}

Response 201:
{
  requestId: string;
  estimatedResponseTime: string; // "24 hours"
}

Errors:
- 400: Validation error
- 408: Request timeout
```

#### GET /api/company-info
```typescript
Response 200:
{
  companyInfo: CompanyInfo;
}
```

### 3.5 User Profile Endpoints

#### GET /api/users/me
```typescript
Headers:
Authorization: Bearer <accessToken>

Response 200:
{
  user: UserProfile;
}

Errors:
- 401: Unauthorized
```

#### PUT /api/users/me
```typescript
Headers:
Authorization: Bearer <accessToken>

Request Body:
{
  name?: string; // max 100
  phoneNumber?: string; // max 20
  languagePreference?: 'fr' | 'en';
}

Response 200:
{
  user: UserProfile;
  message: string;
}

Errors:
- 400: Validation error
- 401: Unauthorized
```

### 3.6 Request Tracking Endpoints

#### GET /api/requests
```typescript
Headers:
Authorization: Bearer <accessToken>

Query Parameters:
- limit?: number (default 20)
- offset?: number (default 0)

Response 200:
{
  requests: Request[];
  total: number;
  hasMore: boolean;
}

Errors:
- 401: Unauthorized
```

#### GET /api/requests/:id
```typescript
Headers:
Authorization: Bearer <accessToken>

Response 200:
{
  request: Request;
}

Errors:
- 401: Unauthorized
- 403: Not authorized to view this request
- 404: Request not found
```

### 3.7 Identity Verification Endpoints

#### POST /api/identity-verification
```typescript
Headers:
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

Request Body:
{
  documentType: 'national_id' | 'passport' | 'driver_license';
  documentFront: File; // JPEG, PNG, PDF, max 10MB
  documentBack?: File; // JPEG, PNG, PDF, max 10MB
}

Response 201:
{
  verificationId: string;
  status: 'pending';
  estimatedTimeframe: string; // "2-5 business days"
}

Errors:
- 400: Invalid file format or size
- 401: Unauthorized
- 408: Upload timeout
```

#### GET /api/identity-verification/status
```typescript
Headers:
Authorization: Bearer <accessToken>

Response 200:
{
  status: 'not_started' | 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  submittedAt?: Date;
}

Errors:
- 401: Unauthorized
```

### 3.8 Notification Endpoints

#### GET /api/notifications/settings
```typescript
Headers:
Authorization: Bearer <accessToken>

Response 200:
{
  settings: NotificationSettings;
}

Errors:
- 401: Unauthorized
```

#### PUT /api/notifications/settings
```typescript
Headers:
Authorization: Bearer <accessToken>

Request Body:
{
  requestUpdatesEnabled?: boolean;
  learningContentEnabled?: boolean;
  identityVerificationEnabled?: boolean;
}

Response 200:
{
  settings: NotificationSettings;
  message: string;
}

Errors:
- 401: Unauthorized
```

#### POST /api/notifications/register-device
```typescript
Headers:
Authorization: Bearer <accessToken>

Request Body:
{
  pushToken: string;
  platform: 'ios' | 'android';
}

Response 200:
{
  message: string;
}

Errors:
- 401: Unauthorized
```

### 3.9 Search Endpoint

#### GET /api/search
```typescript
Query Parameters:
- query: string (1-200 chars)

Response 200:
{
  results: Array<{
    id: string;
    title: string;
    type: 'service' | 'content' | 'help';
    excerpt: string;
  }>;
  total: number;
}

Errors:
- 400: Invalid query length
```

## 4. Mobile Application Architecture

### 4.1 Folder Structure

```
src/
├── api/                    # API client and endpoints
│   ├── client.ts          # Axios configuration
│   ├── auth.ts            # Auth endpoints
│   ├── services.ts        # Service endpoints
│   ├── content.ts         # Content endpoints
│   ├── requests.ts        # Request endpoints
│   └── profile.ts         # Profile endpoints
├── components/            # Reusable components
│   ├── common/           # Generic components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── navigation/           # Navigation configuration
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx
├── screens/              # Screen components
│   ├── auth/            # Auth screens
│   ├── home/            # Home screen
│   ├── services/        # Service screens
│   ├── learning/        # Learning screens
│   ├── contact/         # Contact screens
│   └── profile/         # Profile screens
├── store/               # Redux store
│   ├── slices/         # Redux slices
│   ├── middleware/     # Custom middleware
│   └── store.ts        # Store configuration
├── hooks/              # Custom hooks
├── utils/              # Utility functions
│   ├── validation.ts   # Form validation
│   ├── encryption.ts   # Encryption utilities
│   ├── storage.ts      # Secure storage
│   └── i18n.ts        # Internationalization
├── constants/          # Constants and config
├── types/              # TypeScript types
└── theme/              # Theme configuration
```

### 4.2 Navigation Structure

```
App
├── Auth Stack (if not logged in)
│   ├── Welcome Screen
│   ├── Login Screen
│   └── Register Screen
│
└── Main Tab Navigator (if logged in)
    ├── Home Tab
    │   └── Home Screen
    │       ├── Service Detail Screen
    │       └── Search Results Screen
    │
    ├── Services Tab
    │   ├── Services List Screen
    │   └── Service Detail Screen
    │
    ├── Learning Tab
    │   ├── Learning Home Screen
    │   ├── Content List Screen (by difficulty)
    │   ├── Content Detail Screen
    │   └── Search Results Screen
    │
    ├── Contact Tab
    │   ├── Contact Options Screen
    │   └── Contact Form Screen
    │
    └── Profile Tab
        ├── Profile Screen
        ├── Edit Profile Screen
        ├── My Requests Screen
        │   └── Request Detail Screen
        ├── Identity Verification Screen
        ├── Notification Settings Screen
        └── Settings Screen
```

### 4.3 State Management

**Redux Store Structure:**
```typescript
{
  auth: {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
  },
  services: {
    items: Service[];
    loading: boolean;
    error: string | null;
  },
  content: {
    items: LearningContent[];
    loading: boolean;
    error: string | null;
    filters: {
      difficultyLevel: string | null;
      contentType: string | null;
    };
  },
  requests: {
    items: Request[];
    loading: boolean;
    error: string | null;
  },
  notifications: {
    settings: NotificationSettings | null;
    loading: boolean;
  },
  app: {
    language: 'fr' | 'en';
    theme: 'light' | 'dark';
    isOnline: boolean;
  },
  cache: {
    cachedPages: Map<string, CachedData>;
    lastSync: Date | null;
  }
}
```

### 4.4 Offline Support Strategy

1. **Cache Management:**
   - Store last 50 viewed pages in AsyncStorage
   - Cache services list and company info indefinitely
   - Cache learning content for 7 days
   - Cache user profile and requests for session duration

2. **Sync Strategy:**
   - Queue write operations when offline
   - Sync automatically when connection restored
   - Retry failed operations up to 3 times
   - Show sync status indicator in UI

3. **Conflict Resolution:**
   - Server data takes precedence
   - Notify user of conflicts
   - Allow manual retry

## 5. Security Architecture

### 5.1 Authentication Flow

```
1. User Login
   ↓
2. Backend validates credentials
   ↓
3. Generate JWT access token (15 min expiry)
   ↓
4. Generate refresh token (7 days expiry)
   ↓
5. Store tokens in secure storage (Keychain/Keystore)
   ↓
6. Attach access token to all requests
   ↓
7. On 401 error, attempt refresh
   ↓
8. If refresh fails, redirect to login
```

### 5.2 Data Encryption

**In Transit:**
- TLS 1.3 for all API communication
- Certificate pinning to prevent MITM attacks
- Validate server certificates

**At Rest:**
- Sensitive data encrypted with AES-256
- Use react-native-keychain for credentials
- Encrypt cached data in AsyncStorage
- Identity documents encrypted before upload

### 5.3 Session Management

- Auto-logout after 15 minutes of inactivity
- Track last activity timestamp
- Clear sensitive data on logout
- Implement account lockout after 5 failed attempts

### 5.4 Input Validation

- Validate all inputs on client side
- Sanitize user inputs to prevent injection
- Validate file types and sizes before upload
- Implement rate limiting on API

## 6. UI/UX Design Principles

### 6.1 Design System

**Color Palette:**
- Primary: Gold/Yellow (#FFB800) - representing crypto/value
- Secondary: Dark Blue (#0A1828) - trust and professionalism
- Accent: Electric Blue (#00D9FF) - modern and tech
- Background: White (#FFFFFF) / Dark (#1A1A1A)
- Text: Dark Gray (#333333) / Light Gray (#F5F5F5)
- Success: Green (#00C853)
- Error: Red (#D32F2F)
- Warning: Orange (#FF6F00)

**Typography:**
- Headings: Inter Bold, 24-32px
- Body: Inter Regular, 14-16px
- Captions: Inter Regular, 12px
- Buttons: Inter Semi-Bold, 16px

**Spacing:**
- Base unit: 8px
- Margins: 16px, 24px, 32px
- Padding: 8px, 16px, 24px

### 6.2 Key Screens Wireframes

**Home Screen:**
- Hero section with company tagline
- Featured services (3-4 cards)
- Quick actions (Contact, Learn, Profile)
- Search bar at top
- Bottom tab navigation

**Services Screen:**
- List of services with icons
- Summary text visible
- Tap to expand details
- CTA button for each service

**Learning Screen:**
- Tabs for difficulty levels
- Content cards with images
- Progress indicators
- Search functionality

**Profile Screen:**
- User avatar and name
- Profile information
- My Requests section
- Identity verification status
- Settings and logout

### 6.3 Responsive Design

- Support portrait and landscape
- Adapt layout for tablets
- Touch targets minimum 44x44 points
- Handle keyboard interactions
- Support iOS safe areas

## 7. Performance Requirements

### 7.1 Response Times

- Screen transitions: < 300ms
- API calls: < 2 seconds
- Search results: < 2 seconds
- Touch feedback: < 100ms
- Image loading: Progressive, with placeholders

### 7.2 Optimization Strategies

- Lazy load images
- Pagination for long lists (20 items per page)
- Memoization for expensive computations
- Code splitting for faster initial load
- Optimize bundle size (< 30MB)

## 8. Push Notifications

### 8.1 Notification Types

1. **Request Status Updates:**
   - Title: "Request Update"
   - Body: "Your request #123 status changed to {status}"
   - Data: { type: 'request', requestId: 'uuid' }

2. **New Learning Content:**
   - Title: "New Content Available"
   - Body: "{contentTitle} - Check it out!"
   - Data: { type: 'content', contentId: 'uuid' }

3. **Identity Verification:**
   - Title: "Verification Update"
   - Body: "Your identity verification is {status}"
   - Data: { type: 'verification', status: 'verified|rejected' }

### 8.2 Implementation

- Use Firebase Cloud Messaging (FCM) for Android
- Use Apple Push Notification Service (APNS) for iOS
- Register device token on login
- Unregister token on logout
- Handle notification taps with deep linking
- Show in-app notifications when app is active

## 9. Testing Strategy

### 9.1 Unit Tests

- Test utility functions
- Test Redux reducers and actions
- Test API client methods
- Target coverage: 80%+

### 9.2 Integration Tests

- Test API endpoints
- Test authentication flow
- Test data synchronization
- Test offline functionality

### 9.3 E2E Tests

- Test critical user journeys:
  - Registration and login
  - Service discovery
  - Content browsing
  - Contact submission
  - Profile management

### 9.4 Device Testing

- Test on iOS 14, 15, 16
- Test on Android 8, 10, 12, 13
- Test on various screen sizes
- Test on low-end devices

## 10. Deployment Strategy

### 10.1 Mobile App Deployment

**iOS:**
- Build with Xcode
- Submit to App Store Connect
- TestFlight for beta testing
- Release through App Store

**Android:**
- Build with Gradle
- Submit to Google Play Console
- Internal testing track
- Production release

### 10.2 Backend Deployment

- Dockerize backend services
- Deploy to AWS/GCP/Azure
- Use managed database services
- Set up CI/CD pipeline
- Implement blue-green deployment

### 10.3 Monitoring & Analytics

- Error tracking with Sentry
- Performance monitoring
- User analytics with Firebase
- API monitoring with Datadog
- Log aggregation

## 11. Internationalization

### 11.1 Language Support

- French (primary)
- English (secondary)
- All UI text externalized
- Date/time formatting per locale
- Number formatting per locale

### 11.2 Content Translation

- Services translated in both languages
- Learning content translated
- Error messages translated
- Email templates translated

## 12. Accessibility

### 12.1 Requirements

- Screen reader support
- High contrast mode
- Adjustable font sizes
- Touch target sizes (44x44 minimum)
- Color contrast ratios (WCAG AA)
- Keyboard navigation support

## 13. Future Enhancements

### 13.1 Phase 2 Features

- In-app chat with support
- Video tutorials
- Crypto price tracking
- Wallet integration
- Biometric authentication
- Social features (forums, comments)
- Referral program
- Advanced analytics dashboard

### 13.2 Scalability Considerations

- Microservices architecture for backend
- CDN for static assets
- Database sharding for large datasets
- Horizontal scaling for API servers
- Message queue for async operations (RabbitMQ/SQS)
