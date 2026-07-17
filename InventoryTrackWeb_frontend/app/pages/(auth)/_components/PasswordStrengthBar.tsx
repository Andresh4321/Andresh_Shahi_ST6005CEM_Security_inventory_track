"use client";
export default function PasswordStrengthBar({ password }: { password: string }) {
    const getStrength = (pwd: string) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++;
        return score;
    };

    const score = getStrength(password);
    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', 'bg-red-500', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'];
    const widths = ['w-0', 'w-1/6', 'w-2/6', 'w-3/6', 'w-4/6', 'w-5/6', 'w-full'];

    if (!password) return null;

    return (
        <div className="mt-1">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${colors[score]} ${widths[score]} transition-all duration-300 rounded-full`} />
            </div>
            <p className={`text-xs mt-1 ${score <= 2 ? 'text-red-500' : score <= 4 ? 'text-orange-500' : 'text-green-600'}`}>
                Password Strength: {labels[score]}
            </p>
        </div>
    );
}
