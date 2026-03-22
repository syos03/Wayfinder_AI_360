/**
 * Profile Management API
 * PATCH /api/profile - Update own profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import User from '@/lib/models/User'
import { getCurrentUser } from '@/lib/auth/server-auth'

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received update request:', body)

    const { name, bio, avatar, coverImage, location, website, socialLinks, phone, preferences } = body

    const user = await User.findById(currentUser.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (name !== undefined) user.name = name.trim()
    if (bio !== undefined) user.bio = bio.trim().substring(0, 500)
    if (avatar !== undefined) user.avatar = avatar
    if (coverImage !== undefined) user.coverImage = coverImage
    if (phone !== undefined) user.phone = phone
    if (website !== undefined) user.website = website.trim()

    if (location) {
      user.location = {
        city: location.city?.trim() || '',
        country: location.country?.trim() || '',
      }
      console.log('Setting location:', user.location)
    }

    if (socialLinks) {
      user.socialLinks = {
        facebook: socialLinks.facebook?.trim() || '',
        instagram: socialLinks.instagram?.trim() || '',
        twitter: socialLinks.twitter?.trim() || '',
      }
    }

    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      }
    }

    console.log('Saving user with location:', user.location)
    console.log('User before save:', {
      location: user.location,
      coverImage: user.coverImage ? 'HAS DATA' : 'EMPTY',
      website: user.website,
    })

    const savedUser = await user.save()

    console.log('User saved successfully')
    console.log('Saved location:', savedUser.location)
    console.log('Saved coverImage:', savedUser.coverImage ? 'HAS DATA' : 'EMPTY')
    console.log('Saved website:', savedUser.website)

    const verifyUser = await User.findById(currentUser.id)
    console.log('Verify from DB - Location:', verifyUser?.location)
    console.log('Verify from DB - CoverImage:', verifyUser?.coverImage ? 'HAS DATA' : 'EMPTY')

    const userObject = savedUser.toObject()
    delete userObject.passwordHash
    delete userObject.permissions

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: userObject,
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
