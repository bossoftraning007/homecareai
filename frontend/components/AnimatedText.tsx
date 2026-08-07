'use client'
import { useEffect, useRef } from 'react'
import anime from 'animejs'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
}

export default function AnimatedText({ text, className = '', delay = 0 }: AnimatedTextProps) {
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!textRef.current) return

    const letters = text.split('').map(letter =>
      letter === ' ' ? '<span>&nbsp;</span>' : `<span class="inline-block">${letter}</span>`
    ).join('')

    textRef.current.innerHTML = letters

    anime({
      targets: textRef.current.querySelectorAll('span'),
      translateY: [50, 0],
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 1500,
      delay: anime.stagger(30, { start: delay }),
    })
  }, [text, delay])

  return <span ref={textRef} className={className} />
}