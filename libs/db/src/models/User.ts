import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export function validateUser(
  user: Pick<User, 'email' | 'password' | 'firstName' | 'lastName'>
): string | null {
  if (
    !String(user.email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  ) {
    return 'Valid email is required';
  }
  if (!user.password) {
    return 'Password is required';
  }
  if (user.password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  if (user.firstName.length < 2) {
    return 'First name must be at least 2 characters long';
  }
  if (user.lastName.length < 2) {
    return 'Last name must be at least 2 characters long';
  }
  return null;
}
