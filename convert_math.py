import re
import os

# File Path
file_path = "/Users/javiermauriciosierra/Documents/Trabajo 2026/Usta 2026I/Python_para_APIS_e_IA/Muestreo aleatorio simple_WR.html"

def clean_latex_content(text):
    # Fixes for artifacts created by previous erroneous runs
    
    # 1. Remove HTML tags inside LaTeX sub/sup
    # _{<sub>i=1</sub>} -> _{i=1}
    text = re.sub(r'_\{\s*<sub\s*>(.*?)</sub>\s*\}', r'_{\1}', text, flags=re.IGNORECASE)
    text = re.sub(r'\^\{\s*<sup\s*>(.*?)</sup>\s*\}', r'^{\1}', text, flags=re.IGNORECASE)
    
    # 2. Merge adjacent math blocks: $\sum$$y_i$ -> $\sum y_i$
    text = text.replace('$$', ' ')
    
    return text

def convert_math_content_fresh(text):
    # This logic applies to text NOT already in LaTeX
    
    # Summation with limits
    def sum_replacer(match):
        # Group 1: Symbol
        # Group 2: Whole sub tag
        # Group 3: Sub content
        # Group 4: Whole sup tag
        # Group 5: Sup content
        sub = match.group(3)
        sup = match.group(5)
        result = r'\sum'
        if sub:
            result += f'_{{{sub}}}'
        if sup:
            result += f'^{{{sup}}}'
        return f'${result}$'

    text = re.sub(r'(∑|&sum;)(\s*<sub\s*>(.*?)</sub>)?(\s*<sup\s*>(.*?)</sup>)?', sum_replacer, text, flags=re.IGNORECASE)

    # Product with limits
    def prod_replacer(match):
        sub = match.group(3)
        sup = match.group(5)
        result = r'\prod'
        if sub:
            result += f'_{{{sub}}}'
        if sup:
            result += f'^{{{sup}}}'
        return f'${result}$'

    text = re.sub(r'(∏)(\s*<sub\s*>(.*?)</sub>)?(\s*<sup\s*>(.*?)</sup>)?', prod_replacer, text, flags=re.IGNORECASE)

    # Variables with subscripts
    vars = r'[yYnNuUeEkpPqQσπȳŷ]' 
    def var_sub_replacer(match):
        var = match.group(1)
        sub = match.group(2)
        if var == 'ȳ': var_latex = r'\bar{y}'
        elif var == 'ŷ': var_latex = r'\hat{y}'
        elif var == 'σ': var_latex = r'\sigma'
        elif var == 'π': var_latex = r'\pi'
        else: var_latex = var
        return f'${var_latex}_{{{sub}}}$'
        
    text = re.sub(f'({vars})<sub\s*>(.*?)</sub>', var_sub_replacer, text, flags=re.IGNORECASE)

    # Single symbols
    text = re.sub(r'(?<!\$)(ȳ)(?!\$)', r'$\\bar{y}$', text)
    text = re.sub(r'(?<!\$)(ŷ)(?!\$)', r'$\\hat{y}$', text)
    text = re.sub(r'(?<!\$)(σ²)(?!\$)', r'$\\sigma^2$', text)
    text = re.sub(r'(?<!\$)(s²)(?!\$)', r'$s^2$', text)
    
    return text

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Clean up existing content (fix the bad regex results from last run)
    content = clean_latex_content(content)
    
    # Step 2: Rerun conversion on remaining parts?
    # Since we modified the file in place previously, we might have partial conversions.
    # The 'clean_latex_content' fixes the specific issue `_{<sub>...</sub>}`.
    # Let's run a pass to check if we missed anything else or if new patterns emerge.
    
    parts = content.split('$')
    new_parts = []
    count = 0
    
    for i, part in enumerate(parts):
        if i % 2 == 0:
            # Outside LaTeX
            processed_part = convert_math_content_fresh(part)
            if processed_part != part:
                count += 1
            new_parts.append(processed_part)
        else:
            # Inside LaTeX
            # We can also clean up inside LaTeX if needed, but clean_latex_content did it globally
            # because the tags were inside the string.
            # However, split('$') removes the $, so if we had `\sum_{<sub>...</sub>}`, 
            # `clean_latex_content` handled it before split.
            new_parts.append(part)
            
    new_content = '$'.join(new_parts)
    
    # Final cleanup of merged blocks just in case
    new_content = new_content.replace('$$', ' ')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"Processed file. Cleaned artifacts and converted {count} new sections.")

if __name__ == "__main__":
    if os.path.exists(file_path):
        process_file(file_path)
    else:
        print(f"Error: File not found at {file_path}")
