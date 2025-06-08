declare module '@auth/core/types' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string | null
      isAdmin?: boolean
      role?: string | null
    }
  }
}
