"use client";

import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAtomValue } from "jotai";
import { motion, type Variants } from "motion/react";
import { latestIncomeCeilingDateAtom } from "@/atoms/income-ceiling-atom";
import { ceilingComparisonAtom } from "@/atoms/result-atom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CPF_INCOME_CEILING,
  CPF_INCOME_CEILING_BEFORE_SEPT_2023,
} from "@/constants";
import useAnimatedNumber from "@/hooks/use-animated-number";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const MotionCard = motion.create(Card);

const CeilingComparisonCard = () => {
  const comparison = useAtomValue(ceilingComparisonAtom);
  const currentCeilingDate = useAtomValue(latestIncomeCeilingDateAtom);
  const currentCeiling = CPF_INCOME_CEILING[currentCeilingDate];

  // Flip the perspective: show impact under CURRENT ceiling vs old
  // Positive = you have MORE under current ceiling
  // Negative = you have LESS under current ceiling
  const takeHomeImpact = -comparison.takeHomePayDifference;
  const cpfImpact = -comparison.totalContributionDifference;

  // Hide the card if there are no differences to show
  const hasNoDifference = takeHomeImpact === 0 && cpfImpact === 0;

  const animatedTakeHomeImpact = useAnimatedNumber(takeHomeImpact);
  const animatedCpfImpact = useAnimatedNumber(cpfImpact);

  const formatDifference = (value: number) => {
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${formatCurrency(value)}`;
  };

  const ceilingHasIncreased =
    currentCeiling > CPF_INCOME_CEILING_BEFORE_SEPT_2023;

  if (hasNoDifference) {
    return null;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const timelineVariants: Variants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <MotionCard
      className="shadow-md"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <CardHeader>
        <motion.div variants={itemVariants}>
          <CardTitle>How the Ceiling Change Affects You</CardTitle>
          <CardDescription className="mb-4">
            What the new ceiling means for your money
          </CardDescription>
        </motion.div>
        {/* Timeline visual */}
        <motion.div className="flex items-center gap-4" variants={itemVariants}>
          <div className="flex flex-col items-center">
            <span className="font-mono font-semibold text-muted-foreground">
              {formatCurrency(CPF_INCOME_CEILING_BEFORE_SEPT_2023, 0)}
            </span>
            <span className="text-muted-foreground text-xs">Pre-Sept 2023</span>
          </div>
          <div className="relative flex-1">
            <motion.div
              className="origin-left border-muted-foreground/40 border-t-2 border-dashed"
              variants={timelineVariants}
            />
            <motion.div
              className="-translate-y-1/2 absolute top-1/2 right-0 size-0 border-y-4 border-y-transparent border-l-6 border-l-muted-foreground/40"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono font-semibold text-accent">
              {formatCurrency(currentCeiling, 0)}
            </span>
            <span className="text-muted-foreground text-xs">Current</span>
          </div>
        </motion.div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Comparison Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Take-home Pay Impact */}
          <motion.div
            className="rounded-lg border bg-muted/30 p-4"
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <p className="mb-4 text-muted-foreground text-sm">
              Take-home pay change
            </p>
            <div className="mb-2 flex items-center gap-2">
              <motion.div
                initial={{ rotate: takeHomeImpact >= 0 ? -90 : 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              >
                <HugeiconsIcon
                  icon={takeHomeImpact >= 0 ? ArrowUp01Icon : ArrowDown01Icon}
                  className={cn(
                    "size-5",
                    takeHomeImpact >= 0 ? "text-emerald-600" : "text-amber-600",
                  )}
                  strokeWidth={2}
                />
              </motion.div>
              <p
                className={cn(
                  "font-mono font-semibold text-lg",
                  takeHomeImpact >= 0 ? "text-emerald-600" : "text-amber-600",
                )}
              >
                {formatDifference(animatedTakeHomeImpact)}
              </p>
            </div>
            <p className="text-muted-foreground text-xs">
              {takeHomeImpact < 0
                ? "Less take-home under current ceiling"
                : takeHomeImpact > 0
                  ? "More take-home under current ceiling"
                  : "No difference in take-home pay"}
            </p>
          </motion.div>

          {/* CPF Contribution Impact */}
          <motion.div
            className="rounded-lg border bg-muted/30 p-4"
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <p className="mb-4 text-muted-foreground text-sm">
              Your retirement savings change
            </p>
            <div className="mb-2 flex items-center gap-2">
              <motion.div
                initial={{ rotate: cpfImpact >= 0 ? -90 : 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <HugeiconsIcon
                  icon={cpfImpact >= 0 ? ArrowUp01Icon : ArrowDown01Icon}
                  className={cn(
                    "size-5",
                    cpfImpact >= 0 ? "text-accent" : "text-muted-foreground",
                  )}
                  strokeWidth={2}
                />
              </motion.div>
              <p
                className={cn(
                  "font-mono font-semibold text-lg",
                  cpfImpact >= 0 ? "text-accent" : "text-muted-foreground",
                )}
              >
                {formatDifference(animatedCpfImpact)}
              </p>
            </div>
            <p className="text-muted-foreground text-xs">
              {cpfImpact > 0
                ? "More retirement savings under current ceiling"
                : cpfImpact < 0
                  ? "Less retirement savings under current ceiling"
                  : "No difference in retirement savings"}
            </p>
          </motion.div>
        </div>

        {/* Explanatory Note */}
        {ceilingHasIncreased && (
          <motion.div
            className="rounded-md bg-muted/50 p-4"
            variants={itemVariants}
          >
            <p className="text-muted-foreground text-sm">
              The CPF income ceiling increased from{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(CPF_INCOME_CEILING_BEFORE_SEPT_2023, 0)}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(currentCeiling, 0)}
              </span>
              . Higher earners now have more income growing as retirement
              savings — though take-home pay decreases.
            </p>
          </motion.div>
        )}
      </CardContent>
    </MotionCard>
  );
};

export default CeilingComparisonCard;
