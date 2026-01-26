import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/payment/'],
        },
        sitemap: 'https://kuccpscoursechecker.co.ke/sitemap.xml',
    }
}
