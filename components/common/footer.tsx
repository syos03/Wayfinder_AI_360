import Link from "next/link"
import { Compass, Sparkles, Heart, Mail, Twitter, Github, Facebook, Instagram } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <Compass className="h-6 w-6 text-primary transition-transform duration-200 group-hover:rotate-12" />
              <span className="font-semibold text-lg text-foreground">
                Wayfinder AI
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Nền tảng khám phá du lịch thông minh với AI. Tìm kiếm điểm đến, đọc đánh giá và lên kế hoạch du lịch hoàn hảo cho chuyến đi của bạn.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <Link 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Sản phẩm</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  href="/explore" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Khám phá điểm đến
                </Link>
              </li>
              <li>
                <Link 
                  href="/ai-planner" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  AI Planner
                </Link>
              </li>
              <li>
                <Link 
                  href="/discover" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Gợi ý cá nhân hóa
                </Link>
              </li>
              <li>
                <Link 
                  href="/favorites" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Yêu thích của tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Công ty</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  href="/about" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog & Tin tức
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link 
                  href="/careers" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Tuyển dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Hỗ trợ</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  href="/help" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link 
                  href="/cookies" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Chính sách Cookie
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} Wayfinder AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="hidden md:inline">Được xây dựng với ❤️ tại Việt Nam</span>
            <span className="text-primary font-medium">Made with Next.js & AI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
