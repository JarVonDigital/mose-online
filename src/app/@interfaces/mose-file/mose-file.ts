export namespace Mose {

  export interface File {
    uuid?: string,
    assignedTo: string,
    created: string,
    isLocked: boolean,
    location: string,
    liveFeed?: {
      [key: string]: {
        elementID: string,
        cursorPosition: number,
        user: Mose.User,
        isActive: boolean,
        inDocument: boolean
      }
    }
    scrollLock: {
      [key: string]: string
    },
    taskStatus: number,
    title: string,
    subtitles: Subtitle[]
  }

  export interface Subtitle {
    id: number
    eTime: number,
    eTimeFormatted: number,
    sTime: number,
    sTimeFormatted: number,
    isActive: boolean,
    utterance: string,
    languages: {
      [key: string]: string
    }
  }

  export interface User {
    email: string,
    firstName: string,
    lastName: string,
    workingLanguage?: string,
    roles: Roles
  }

  export interface Roles {
    isDev: boolean,
    isLead: boolean
  }

}
