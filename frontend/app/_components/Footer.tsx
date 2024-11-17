'use client';
import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { name: 'About Us', href: '/' },
            { name: 'Culture', href: '/' },
        ],
        resources: [
            { name: 'Help Center', href: '/' },
            { name: 'Contact', href: '/' },
            { name: "What's New", href: '/' },
        ],
        careers: [
            { name: 'Open Roles', href: '/' },
        ],
    };

    const socialLinks = [
        { icon: Linkedin, href: 'https://linkedin.com' },
        { icon: Twitter, href: 'https://twitter.com' },
        { icon: Instagram, href: 'https://instagram.com' },
        { icon: Youtube, href: 'https://youtube.com' },
    ];

    return (
        <footer className="w-full bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <Image
                            src='/logo.png'
                            width={120}
                            height={120}
                            alt="logo"
                        />
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-gray-600 hover:text-gray-900">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            {footerLinks.resources.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-gray-600 hover:text-gray-900">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Careers</h3>
                        <ul className="space-y-2">
                            {footerLinks.careers.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-gray-600 hover:text-gray-900">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-sm text-gray-600">
                            © {currentYear} Your Company. All rights reserved.
                        </div>

                        <div className="flex space-x-6">
                            {socialLinks.map((social, index) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={index}
                                        href={social.href}
                                        className="text-gray-600 hover:text-gray-900"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Icon className="h-5 w-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;