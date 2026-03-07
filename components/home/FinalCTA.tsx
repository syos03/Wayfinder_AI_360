"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeInUp } from "@/lib/ui/animations";

export function FinalCTA() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="relative max-w-7xl mx-auto rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
          className="relative z-10 text-center py-20 px-6"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Được hàng nghìn người tin dùng
            </Badge>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="mb-6 text-4xl md:text-6xl font-bold text-white"
          >
            Sẵn sàng khám phá Việt Nam?
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mb-10 max-w-2xl text-xl text-white/90"
          >
            Tham gia cùng hàng nghìn người đã tạo ra những chuyến đi đáng nhớ với Wayfinder AI
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-8"
          >
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-50 text-base px-10 shadow-xl"
              asChild
            >
              <Link href="/register">
                Đăng ký miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary text-base px-10 backdrop-blur-sm"
              asChild
            >
              <Link href="/explore">Khám phá ngay</Link>
            </Button>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-white/80 text-sm">
            Không cần thẻ tín dụng • Thiết lập trong 30 giây • Miễn phí mãi mãi
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}


