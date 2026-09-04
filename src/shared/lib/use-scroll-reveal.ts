"use client";
import { useEffect } from "react";
export function useScrollReveal() { useEffect(() => { const items = document.querySelectorAll<HTMLElement>("[data-reveal]"); const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.14 }); items.forEach((item) => observer.observe(item)); return () => observer.disconnect(); }, []); }
