export interface MoseUser {
  email: string,
  firstName: string,
  lastName: string,
  workingLanguage?: string,
  roles: {
    isDev: boolean,
    isLead: boolean
  }
}
