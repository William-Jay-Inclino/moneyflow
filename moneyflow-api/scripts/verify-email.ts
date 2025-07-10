import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUserEmail(email: string, token: string) {
  try {
    console.log(`Attempting to verify email: ${email} with token: ${token}`);
    
    // Find user by email and token
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        email_verify_token: token,
      },
    });

    if (!user) {
      console.log('❌ User not found or invalid token');
      return;
    }

    if (user.email_verified) {
      console.log('❌ Email is already verified');
      return;
    }

    // Update user as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        email_verify_token: null,
      },
    });

    console.log('✅ Email verified successfully!');
    console.log('User details:', {
      id: updatedUser.id,
      email: updatedUser.email,
      email_verified: updatedUser.email_verified,
      registered_at: updatedUser.registered_at,
    });
    
  } catch (error) {
    console.error('❌ Error verifying email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const email = process.argv[2];
const token = process.argv[3];

if (!email || !token) {
  console.log('Usage: npm run verify-email <email> <token>');
  console.log('Example: npm run verify-email nightfury102497@gmail.com a36b7272fc2974068d47c009e5308d86170a6c6c5b9ec4c93585652651548a89');
  process.exit(1);
}

verifyUserEmail(email, token);
