import { SignupFormSchema, FormState } from '@/lib/definitions'
 
export async function signup(state: FormState, formData: FormData) {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
 
  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
 
  // Call the provider or db to create a user...
}






// // app/actions/auth.js
// 'use server'

// import { hash } from 'bcryptjs'
// import clientPromise from '@/lib/db'    // your Mongo client wrapper
// import { redirect } from 'next/navigation'

// /** 
//  * Server Action: handle user signup 
//  * @param {FormData} formData 
//  */
// export async function signup(formData) {
//   const name = formData.get('name')?.toString().trim()
//   const email = formData.get('email')?.toString().trim().toLowerCase()
//   const password = formData.get('password')?.toString()

//   // basic validation
//   if (!name || !email || !password) {
//     throw new Error('All fields are required.')
//   }
//   if (!email.includes('@')) {
//     throw new Error('Please provide a valid email.')
//   }
//   if (password.length < 6) {
//     throw new Error('Password must be at least 6 characters.')
//   }

//   // hash the password
//   const hashed = await hash(password, 10)

//   // insert into MongoDB
//   const client = await clientPromise
//   const db = client.db()
//   const existing = await db.collection('users').findOne({ email })
//   if (existing) {
//     throw new Error('An account with that email already exists.')
//   }

//   await db.collection('users').insertOne({
//     name,
//     email,
//     password: hashed,
//     createdAt: new Date()
//   })

//   // on success, redirect to login page
//   redirect('/login')
// }
