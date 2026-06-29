//Added role,location,githubLink as string | null 
//Added hobbies as string[]

//Added socialLinks: { label, url }[] to ProfileRecord only
//Not a column on the profiles table — comes from the social_links table via a join in the GET endpoint, so it's a derived field on the record, not write-side data

export interface ProfileData {
  githubUsername: string
  avatarUrl: string | null
  bio: string | null
  role: string | null
  location: string | null
  githubLink: string | null
  hobbies: string[]
}

export interface ProfileRecord extends ProfileData {
  id: string
  createdAt: Date
  socialLinks: { label: string; url: string }[]
}
