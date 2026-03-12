'use client'

import { motion } from 'framer-motion'
import { Button as UIButton, ButtonProps } from '@/components/ui/button'

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode
}

export function AnimatedButton({ children, className, ...props }: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <UIButton className={className} {...props}>
        {children}
      </UIButton>
    </motion.div>
  )
}
