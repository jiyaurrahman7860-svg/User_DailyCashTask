'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

// Animation Variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
}

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Animation wrapper components
interface AnimatedProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className = '', delay = 0 }: AnimatedProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInUp}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedContainer({ children, className = '' }: AnimatedProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedItem({ children, className = '', delay = 0 }: AnimatedProps) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.3, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Page transition wrapper
export function PageTransition({ children, className = '' }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Pulse animation for notifications/attention
export function PulseAnimation({ children, className = '' }: AnimatedProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.02, 1],
        opacity: [1, 0.9, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Counting animation for numbers
export function CountUpAnimation({ 
  value, 
  duration = 1.5,
  prefix = '',
  suffix = ''
}: { 
  value: number
  duration?: number
  prefix?: string
  suffix?: string
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {prefix}{value.toFixed(2)}{suffix}
      </motion.span>
    </motion.span>
  )
}

// Shake animation for errors
export function ShakeAnimation({ children, className = '', trigger }: AnimatedProps & { trigger?: boolean }) {
  return (
    <motion.div
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, 0],
      } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Hover scale effect
export function HoverScale({ children, className = '', scale = 1.02 }: AnimatedProps & { scale?: number }) {
  return (
    <motion.div
      whileHover={{ scale, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Success checkmark animation
export function SuccessCheckmark({ size = 50 }: { size?: number }) {
  const pathLength = 100

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="25"
        cy="25"
        r="20"
        stroke="#22C55E"
        strokeWidth="3"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 }
        }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      />
      <motion.path
        d="M15 25 L22 32 L35 18"
        stroke="#22C55E"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 }
        }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      />
    </motion.svg>
  )
}

// Modal animation
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: { duration: 0.2 }
  }
}

// Expand animation for cards
export const expandVariants = {
  collapsed: { height: 'auto', opacity: 1 },
  expanded: { 
    height: 'auto', 
    opacity: 1,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
  }
}

// Bounce animation for notifications
export function BounceAnimation({ children, className = '' }: AnimatedProps) {
  return (
    <motion.div
      animate={{
        y: [0, -5, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{
        duration: 0.5,
        repeat: 3,
        repeatDelay: 2
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Staggered fade in for lists
export function StaggeredList({ children, className = '', staggerDelay = 0.05 }: AnimatedProps & { staggerDelay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: staggerDelay }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggeredItem({ children, className = '' }: AnimatedProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
