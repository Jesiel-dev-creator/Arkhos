"use client"

import React from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamMember {
  name: string
  role: string
  bio: string
  avatar?: string
}

interface TeamGridProps {
  heading?: string
  subtitle?: string
  members?: TeamMember[]
}

const defaultMembers: TeamMember[] = [
  {
    name: "Claire Dupont",
    role: "CEO & Co-founder",
    bio: "Former product lead at a top European tech company. Passionate about building tools that empower creators.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Marc Lefebvre",
    role: "CTO & Co-founder",
    bio: "Full-stack engineer with 12 years of experience. Believes great software is built on simplicity and clarity.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Ana Moretti",
    role: "Head of Design",
    bio: "Award-winning designer focused on creating intuitive and delightful user experiences at scale.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Lucas Schmidt",
    role: "Lead Engineer",
    bio: "Open source contributor and performance enthusiast. Specializes in distributed systems and real-time applications.",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function TeamGrid({
  heading = "Meet the Team",
  subtitle = "The people behind the product. A small team with big ambitions.",
  members = defaultMembers,
}: TeamGridProps) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {members.map((member, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col items-center text-center rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <Avatar className="h-20 w-20 border-2 border-border shadow-sm mb-4">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-lg font-semibold bg-muted text-muted-foreground">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-foreground">{member.name}</h3>
              <p className="text-sm text-primary font-medium mt-0.5">
                {member.role}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
