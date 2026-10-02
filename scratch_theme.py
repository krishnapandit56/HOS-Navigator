import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the mapping from dark to light classes
    replacements = [
        # Backgrounds
        ('bg-slate-950', 'bg-slate-50'),
        ('bg-slate-900', 'bg-white'),
        ('bg-slate-800', 'bg-slate-50'),
        ('bg-slate-700', 'bg-slate-100'),
        
        # Borders
        ('border-slate-800', 'border-slate-200'),
        ('border-slate-700', 'border-slate-300'),
        ('border-slate-600', 'border-slate-300'),
        
        # Text colors
        ('text-slate-100', 'text-slate-900'),
        ('text-slate-200', 'text-slate-800'),
        ('text-slate-300', 'text-slate-700'),
        ('text-slate-400', 'text-slate-600'),
        ('text-slate-500', 'text-slate-500'),
        
        # Specific errors / alerts
        ('bg-rose-950/80', 'bg-rose-50'),
        ('border-rose-600/60', 'border-rose-200'),
        ('text-rose-200', 'text-rose-800'),
        ('text-rose-400', 'text-rose-600'),
        
        # Adjust some whites to dark where it makes sense (like headings)
        # Note: we won't blindly replace 'text-white' to avoid ruining buttons (bg-sky-600 text-white)
        ('text-white', 'text-slate-900'),
        # Fix the buttons that got ruined
        ('bg-sky-600 text-slate-900', 'bg-sky-600 text-white'),
        ('text-slate-900" />', 'text-white" />'), # icon inside button
        ('text-slate-900 mt-0.5', 'text-white mt-0.5'),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    # Some manual fixes for buttons and icons
    content = content.replace('bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20">\n              <Truck className="w-6 h-6 text-slate-900"', 'bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20">\n              <Truck className="w-6 h-6 text-white"')
    content = content.replace('text-slate-400 hover:text-slate-900 hover:bg-slate-50', 'text-slate-600 hover:text-slate-900 hover:bg-slate-200')
    content = content.replace('bg-slate-900/90', 'bg-white/90')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

src_dir = r"c:\Users\krishna pandit\Desktop\Truck Project\frontend\src"
for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.jsx', '.css')):
            replace_in_file(os.path.join(root, file))

print("Theme changed to light mode successfully!")
