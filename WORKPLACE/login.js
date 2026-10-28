// 1. Initialize Supabase
const supabaseUrl = 'https://okehpnsfcjbtweuejejs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZWhwbnNmY2pidHdldWVqZWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MDIyMjYsImV4cCI6MjEwODE3ODIyNn0.xJRSQeHtlqEOOYQsnim30FRgI2EaTsEYka0o6Iy7D_c';

// Check if Supabase is loaded from the CDN
if (typeof supabase === 'undefined') {
    console.error("CRITICAL ERROR: Supabase script is not loaded in the HTML!");
} else {
    console.log("Supabase library loaded successfully.");
}

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function loginFunction() {
    console.log("Login button clicked! Starting login process...");

    const emailInput = document.getElementById('login').value.trim();
    const passwordInput = document.getElementById('login-password').value;
    const roleInput = document.getElementById('login-role').value;

    // Check if inputs are empty
    if (!emailInput || !passwordInput) {
        alert("Please enter both email and password.");
        return;
    }

    console.log("Searching database for:", { emailInput, passwordInput, roleInput });

    // Query the database
    const { data, error } = await supabaseClient
        .from('loginDB')
        .select('*')
        .eq('emailDB', emailInput)
        .eq('passwordDB', passwordInput)
        .eq('roleDB', roleInput)
        .maybeSingle(); 

    // Handle database errors
    if (error) {
        alert("Database Error: " + error.message);
        console.error(error);
        return;
    }

    // Handle 0 rows found
    if (!data) {
        alert("Invalid login. No user found with those exact details.");
        return;
    }

    // Success!
    alert(`Welcome back, ${data.nameDB} (${data.roleDB})!`);
    
    localStorage.setItem('userRole', data.roleDB);
    localStorage.setItem('userName', data.nameDB);

    if (data.roleDB === 'Admin') {
        window.location.href = "home.html"; 
    } else {
        window.location.href = "product.html"; 
    }
}

function loginFunction(){
    window.location.href= "home.html"
}