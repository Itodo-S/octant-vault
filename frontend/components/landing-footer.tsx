"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Twitter, Mail, ExternalLink } from "lucide-react"
import Link from "next/link"

interface LandingFooterProps {
  onGetStarted: () => void
}

export function LandingFooter({ onGetStarted }: LandingFooterProps) {
  return (
    <footer className="relative px-4 sm:px-6 lg:px-8 py-16 overflow-hidden border-t border-border/30">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(120,119,198,0.1),transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">◆</span>
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-foreground via-primary to-purple-500 bg-clip-text text-transparent">
                OctantVault
              </span>
            </div>
            <p className="text-foreground/70 mb-6 max-w-md leading-relaxed">
              Fund your team sustainably with yield-powered salaries. Simple, safe, and transparent.
            </p>
            <Button 
              onClick={onGetStarted} 
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all text-white"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-foreground/70 hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-foreground/70 hover:text-primary transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="text-foreground/70 hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#impact" className="text-foreground/70 hover:text-primary transition-colors">
                  Impact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://docs.spark.fi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
                >
                  Documentation
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
                >
                  GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
                >
                  Twitter
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@octantvault.com" 
                  className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
                >
                  Support
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-foreground/60">
            © {new Date().getFullYear()} OctantVault. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 text-foreground/70 hover:text-primary transition-colors" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5 text-foreground/70 hover:text-primary transition-colors" />
            </a>
            <a 
              href="mailto:support@octantvault.com" 
              className="w-10 h-10 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 text-foreground/70 hover:text-primary transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

