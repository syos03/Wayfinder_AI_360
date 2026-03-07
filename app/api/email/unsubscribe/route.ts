/**
 * Email Unsubscribe API
 * Unsubscribe from all non-transactional emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import EmailPreferences from '@/lib/models/EmailPreferences';
import User from '@/lib/models/User';

/**
 * POST /api/email/unsubscribe
 * Unsubscribe user from emails
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    if (!userId || !token) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or token' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify token
    const user = await User.findById(userId);
    
    if (!user || user.unsubscribeToken !== token) {
      return NextResponse.json(
        { success: false, error: 'Invalid unsubscribe link' },
        { status: 400 }
      );
    }

    // Update preferences
    let preferences = await EmailPreferences.findOne({ userId });

    if (!preferences) {
      preferences = await EmailPreferences.create({
        userId,
        transactional: true, // Keep transactional
        notifications: {
          reviews: false,
          followers: false,
          badges: false,
          replies: false,
        },
        marketing: false,
        frequency: 'never',
        unsubscribedAt: new Date(),
      });
    } else {
      preferences.notifications = {
        reviews: false,
        followers: false,
        badges: false,
        replies: false,
      };
      preferences.marketing = false;
      preferences.frequency = 'never';
      preferences.unsubscribedAt = new Date();
      await preferences.save();
    }

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed from all non-critical emails',
    });
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email/unsubscribe
 * Show unsubscribe confirmation page
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  // Return HTML confirmation page
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hủy đăng ký email - Wayfinder AI</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 16px;
          padding: 48px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          color: #1f2937;
          font-size: 32px;
          margin: 0 0 16px;
        }
        p {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 32px;
        }
        .button {
          background: #ef4444;
          color: white;
          border: none;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          width: 100%;
          transition: background 0.2s;
        }
        .button:hover {
          background: #dc2626;
        }
        .back-link {
          display: block;
          margin-top: 24px;
          color: #3b82f6;
          text-decoration: none;
          font-size: 14px;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .success {
          background: #d1fae5;
          border-left: 4px solid #10b981;
          padding: 16px;
          border-radius: 8px;
          margin-top: 24px;
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>❌ Hủy đăng ký email</h1>
        <p>
          Bạn sắp hủy đăng ký nhận email thông báo từ Wayfinder AI. Bạn sẽ không còn 
          nhận được email về đánh giá, người theo dõi, huy hiệu và các thông báo khác.
        </p>
        <p style="font-size: 14px; color: #9ca3af;">
          <strong>Lưu ý:</strong> Bạn vẫn sẽ nhận email quan trọng như đặt lại mật khẩu, 
          xác minh email.
        </p>
        <button class="button" onclick="unsubscribe()">
          Xác nhận hủy đăng ký
        </button>
        <div class="success" id="success">
          ✅ Đã hủy đăng ký thành công! Bạn sẽ không còn nhận email thông báo.
        </div>
        <a href="/" class="back-link">← Quay lại trang chủ</a>
      </div>

      <script>
        async function unsubscribe() {
          try {
            const response = await fetch(window.location.href, {
              method: 'POST',
            });
            const data = await response.json();
            
            if (data.success) {
              document.querySelector('.button').style.display = 'none';
              document.getElementById('success').style.display = 'block';
            } else {
              alert('Lỗi: ' + data.error);
            }
          } catch (error) {
            alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
          }
        }
      </script>
    </body>
    </html>
    `,
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}

