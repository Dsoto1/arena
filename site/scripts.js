// scripts.js

// ScrollReveal animations
document.addEventListener("DOMContentLoaded", function() {
    ScrollReveal().reveal(".headline, .tagline, .punchline", { duration: 2000, delay: 500 });
});

// Fetch stats and update marquee
async function fetchStats() {
    try {
        const response = await fetch('https://flaviusrule.com/stats/latest.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const stats = await response.json();
        const marquee = document.getElementById('stats-marquee');
        marquee.innerText = `Subscribers: ${stats.subscribers} | Favorites: ${stats.favorites}`;
    } catch (error) {
        console.error('Error fetching stats:', error);
        document.getElementById('stats-marquee').innerText = 'Error fetching stats';
    }
}

// Call fetchStats when the page loads
window.onload = fetchStats;
