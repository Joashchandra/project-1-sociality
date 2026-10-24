# Sociality 🚀

### Next.js TypeScript Social Media Web Application

_A feature-rich, responsive social media platform built with strict type safety, real-time optimistic state management, interactive gesture triggers, and seamless cross-profile navigation._

🔗 [**View Live Demo**](https://project-1-sociality.vercel.app/feed)

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)

- **Language:** [TypeScript](https://www.typescriptlang.org/)

- **State Management:** Redux Toolkit & [TanStack Query (React Query)](https://tanstack.com/query)

- **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/), Shadcn UI, Lucide React

- **HTTP Client:** [Axios](https://axios-http.com/)

- **Date Parsing:** [Day.js](https://day.js.org/)

## 🚀 Application Features & Capabilities

### 1. Authentication & Session Management

- **User Login & Registration:** Secure authentication flows backed by validation via Zod schemas (`src/validations/schema.ts`).

- **State Hydration:** Redux Toolkit integrated with local storage hydration (`AuthHydration.tsx`) to maintain user authentication status across page reloads.

### 2. Interactive Feed & Post Interactions (`PostCard.tsx`)

- **Post Details Fetching:** Fetches granular post metadata via `postsApi.getPostDetail` while keeping placeholder data active to prevent layout shifts.

- **Long-Press & Tap Support on Heart Icon:**
  - **Short Tap:** Instantly likes/unlikes the post.

  - **Long Press (**$\ge 500\text{ms}$**):** Triggers the `LikesModal` to reveal all users who interacted with the post.

- **Post Management:** Post owners can access a context menu (`MoreHorizontal`) equipped with a confirmation modal to safely delete their own posts.

- **Saving & Bookmarking:** Users can bookmark or save posts to revisit them later in a private saved collection.

### 3. Rich Modal Overlays

- **Likes Modal (`LikesModal.tsx`):** Displays a detailed list of users who liked a post, complete with optimistic follow/unfollow triggers.

- **Comments Modal (`CommentModal.tsx`):** Enables seamless viewing, posting, and deleting of comments in real-time.

- **Create & Edit Profile Modals:** Dedicated interfaces for generating new posts with media/image uploads and tweaking profile bios and avatars.

### 4. Profiles & Interactive Feeds (`/me` & `/profile/[username]`)

- **Grid & Feed Toggle:** Switch fluidly between uploaded, liked, or saved posts in a clean thumbnail grid view.

- **Smooth Post Navigation:** Clicking any thumbnail transitions seamlessly to the full post feed view, automatically targeting and scrolling to the selected content using `scrollIntoView`.

- **Sticky Navigation Bar:** Floating header bar anchored beneath the navbar featuring an `ArrowLeft` icon and dynamic titles for effortless traversal back to the thumbnail grid.

## 📁 Project Structure & File Tree

```
.
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx
│   │   │   ├── feed/
│   │   │   │   └── page.tsx
│   │   │   ├── me/
│   │   │   │   └── page.tsx
│   │   │   └── profile/
│   │   │       └── [username]/
│   │   │           └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── assets/
│   │   ├── icons/
│   │   │   └── Logo.svg
│   │   └── image/
│   │       └── Gradient.png
│   ├── components/
│   │   ├── shared/
│   │   │   ├── Alert.tsx
│   │   │   ├── AuthBackground.tsx
│   │   │   ├── AuthHydration.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── CommentList.tsx
│   │   │   ├── CommentModal.tsx
│   │   │   ├── CreatePost.tsx
│   │   │   ├── Divider.tsx
│   │   │   ├── EditProfile.tsx
│   │   │   ├── LikesModal.tsx
│   │   │   ├── Logo.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── PostCard.tsx
│   │   │   └── SearchResultList.tsx
│   │   └── ui/
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── textarea.tsx
│   ├── hooks/
│   │   ├── useComments.tsx
│   │   ├── useCurrentUser.tsx
│   │   ├── useInfinitePosts.tsx
│   │   ├── useMe.tsx
│   │   ├── usePostLikes.tsx
│   │   ├── usePostMutation.tsx
│   │   ├── useUserProfile.tsx
│   │   └── useUserSearch.tsx
│   ├── lib/
│   │   ├── axios.ts
│   │   └── utils.ts
│   ├── providers/
│   │   └── AppProvider.tsx
│   ├── services/
│   │   ├── auth/
│   │   │   └── index.ts
│   │   ├── feed/
│   │   │   └── index.ts
│   │   ├── follow/
│   │   │   └── index.ts
│   │   ├── me/
│   │   │   └── index.ts
│   │   ├── post/
│   │   │   └── index.ts
│   │   └── users/
│   │       └── index.ts
│   ├── store/
│   │   ├── authSlice.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   └── validations/
│       └── schema.ts


```

## ⚙️ Getting Started

To run this repository locally, follow these steps:

1. **Clone the repository:**

   ```
   git clone https://github.com/your-username/sociality.git
   cd sociality

   ```

2. **Install dependencies:**

   ```
   npm install
   # or yarn install / pnpm install

   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and provide your API configuration.

4. **Run the development server:**

   ```
   npm run dev
   # or yarn dev / pnpm dev

   ```

5. Open <http://localhost:3000> in your browser to view the application.
