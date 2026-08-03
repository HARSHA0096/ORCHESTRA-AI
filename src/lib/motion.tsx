import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
  type Transition,
} from "framer-motion";
import { type ReactNode } from "react";

/**
 * Orchestra AI — shared motion primitives.
 *
 * Goal: a single, consistent animation language (timing, easing, distances)
 * used everywhere instead of bespoke CSS keyframes per page. Built on
 * framer-motion so we get spring physics, shared-layout transitions, exit
 * animations, and scroll-triggered reveals "for free".
 *
 * Respects prefers-reduced-motion automatically via useReducedMotion().
 */

export const EASE = [0.16, 1, 0.3, 1] as const; // expo-out, the house easing curve

export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 32, mass: 0.6 };
export const springSoft: Transition = { type: "spring", stiffness: 220, damping: 26, mass: 0.8 };

/* ---------------- Page-level transition ---------------- */

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE } },
};

/** Wrap a route's page content. Animates in on mount and out on route change. */
export function PageTransition({ id, children }: { id: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={!reduce}>
      <motion.div
        key={id}
        variants={reduce ? undefined : pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="space-y-4"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------------- Reveal-on-mount / reveal-on-scroll ---------------- */

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * Fades + lifts content into place. Animates once when it first enters the
 * viewport, so long pages feel alive as you scroll instead of all firing
 * at once on mount.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section";
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay }}
    >
      {children}
    </Comp>
  );
}

/* ---------------- Stagger groups (grids, lists) ---------------- */

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

/** Wrap a grid/list of cards; each direct <StaggerItem> reveals in sequence. */
export function StaggerGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

/* ---------------- Micro-interactions ---------------- */

/** Subtle press/hover feedback for clickable surfaces (cards, rows, buttons). */
export function Pressable({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      className={className}
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={springSnappy}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Animated counters (no fake data — pass real values) ---------------- */

export { motion, AnimatePresence };
