"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Compass, Menu, User, LogOut, Shield, Heart, Calendar, Sparkles } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useHasMounted } from "@/components/providers/hydration-provider"
import { useEffect, useState } from "react"

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const hasMounted = useHasMounted()
  const router = useRouter()
  const [favoritesCount, setFavoritesCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavoritesCount()
    }
  }, [isAuthenticated, user])

  const fetchFavoritesCount = async () => {
    try {
      const res = await fetch('/api/favorites', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setFavoritesCount(data.data.count || 0)
      }
    } catch (error) {
      // Silently fail
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // Prevent hydration mismatch by not rendering auth-dependent content until mounted
  if (!hasMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <Compass className="h-5 w-5 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
            <span className="font-semibold text-base text-foreground group-hover:text-primary transition-colors duration-300">
              Wayfinder AI
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
              <Link href="/explore" className="px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground">
                Khám phá
              </Link>
              <Link href="/discover" className="px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground">
                Gợi ý
              </Link>
            </nav>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild size="sm">
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Đăng ký</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <Compass className="h-5 w-5 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
          <span className="font-semibold text-base text-foreground group-hover:text-primary transition-colors duration-300">
            Wayfinder AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link 
            href="/" 
            className="px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            Trang chủ
          </Link>
          <Link 
            href="/explore" 
            className="px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            Khám phá
          </Link>
          <Link 
            href="/discover" 
            className="px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            Gợi ý
          </Link>
          <Link 
            href="/ai-planner"
            className="px-2.5 py-1.5 text-xs font-medium transition-all duration-300 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Sparkles className="inline-block w-3.5 h-3.5 mr-1" />
            AI Planner
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {isAuthenticated && user ? (
            <>
              {/* Favorites Badge */}
              <Link href="/favorites" className="relative hidden md:block">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="w-5 h-5" />
                  {favoritesCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600">
                      {favoritesCount > 9 ? '9+' : favoritesCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-3 p-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5 leading-none">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/explore" className="cursor-pointer">
                      <Compass className="mr-2 h-4 w-4" />
                      Khám phá
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Yêu thích {favoritesCount > 0 && `(${favoritesCount})`}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-plans" className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" /> 
                      Kế hoạch của tôi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.id}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  {user.role && ['admin', 'moderator', 'super_admin'].includes(user.role) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-primary font-medium">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild size="sm">
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Đăng ký</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/" className="w-full cursor-pointer">Trang chủ</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/explore" className="w-full cursor-pointer">Khám phá</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/discover" className="w-full cursor-pointer">Gợi ý</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/ai-planner" className="w-full cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Planner
                </Link>
              </DropdownMenuItem>
              {isAuthenticated && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="w-full cursor-pointer">
                      ❤️ Yêu thích {favoritesCount > 0 && `(${favoritesCount})`}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-plans" className="w-full cursor-pointer">📅 Kế hoạch của tôi</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user?.id}`} className="w-full cursor-pointer">Hồ sơ</Link>
                  </DropdownMenuItem>
                  {user && user.role && ['admin', 'moderator', 'super_admin'].includes(user.role) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full cursor-pointer text-primary font-medium">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    Đăng xuất
                  </DropdownMenuItem>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="w-full cursor-pointer">Đăng nhập</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register" className="w-full cursor-pointer">Đăng ký</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}