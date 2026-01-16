import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://kuccpscoursechecker.co.ke' // Update this with your actual domain

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/banned/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
