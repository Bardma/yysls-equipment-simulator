const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin-pro');

const ROOT = process.cwd();
const exts = new Set(['.ts','.tsx','.js','.jsx','.json','.md','.css','.txt','.yml','.yaml']);
const skipDirs = new Set(['node_modules','.git','.next','dist','build']);

// Manual phrase dictionary (CN -> EN) for high-frequency UI/game concepts.
// We align key English concepts to common community terms (Game8/Fextralife).
const PHRASES = new Map([
  ['Where Winds Meet', 'Where Winds Meet'],
  ['Equipment', 'Equipment'],
  ['Equipment Library', 'Equipment Library'],
  ['Graduation Rate', 'Graduation Rate'],
  ['Graduation Rate Analysis', 'Graduation Rate Analysis'],
  ['Simulation', 'Simulation'],
  ['Analyze', 'Analyze'],
  ['Generate Report', 'Generate Report'],
  ['Import', 'Import'],
  ['Export', 'Export'],
  ['Save', 'Save'],
  ['Confirm', 'Confirm'],
  ['Cancel', 'Cancel'],
  ['Delete', 'Delete'],
  ['Edit', 'Edit'],
  ['New Character', 'New Character'],
  ['Character', 'Character'],
  ['Level Mapping', 'Level Mapping'],
  ['Excel Level Mapping', 'Excel Level Mapping'],
  ['Affix', 'Affix'],
  ['Primary Affix', 'Primary Affix'],
  ['Secondary Affix', 'Secondary Affix'],
  ['Dingyin', 'Dingyin'],
  ['Dingyin Affix', 'Dingyin Affix'],
  ['Inner Way', 'Inner Way'],
  ['Set', 'Set'],
  ['Weapon', 'Weapon'],
  ['Dual Weapons', 'Dual Weapons'],
  ['Head Armor', 'Head Armor'],
  ['Chest Armor', 'Chest Armor'],
  ['Leg Armor', 'Leg Armor'],
  ['Arm Armor', 'Arm Armor'],
  ['Ring', 'Ring'],
  ['Pendant', 'Pendant'],
  ['None', 'None'],
  ['Value', 'Value'],
  ['Compare', 'Compare'],
  ['Convert', 'Convert'],
  ['Cap', 'Cap'],
  ['Current', 'Current'],
  ['Max', 'Max'],
  ['Min', 'Min'],
]);

// Single-word dictionary for stats and mechanics (CN token -> EN token).
const TOKENS = new Map([
  ['Outer', 'Outer'],
  ['Wuxiang', 'Wuxiang'],
  ['Elemental', 'Elemental'],
  ['Attack', 'Attack'],
  ['Damage', 'Damage'],
  ['Bonus', 'Bonus'],
  ['Penetration', 'Penetration'],
  ['Accuracy', 'Accuracy'],
  ['Crit', 'Crit'],
  ['Insight', 'Insight'],
  ['ZhiJie', 'Direct'],
  ['Rate', 'Rate'],
  ['Strength', 'Strength'],
  ['Agility', 'Agility'],
  ['Momentum', 'Momentum'],
  ['Effectiveness', 'Effectiveness'],
  ['DamageUp', 'DamageUp'],
  ['Quan', 'All'],
  ['ZhiDing', 'Specific'],
  ['DuiShouLingDanWei', 'Boss'],
  ['DanWei', 'Unit'],
  ['WuXue', 'Martial'],
  ['JiNeng', 'Skill'],
  ['DanTi', 'SingleTarget'],
  ['QunTi', 'AoE'],
  ['QiShu', 'Art'],
  ['MingJin', 'Mingjin'],
  ['LieShi', 'Lieshi'],
  ['QianSi', 'Qiansi'],
  ['PoZhu', 'Pozhu'],
  ['Jian', 'Sword'],
  ['Qiang', 'Spear'],
  ['San', 'Umbrella'],
  ['Shan', 'Fan'],
  ['ShengBiao', 'RopeDart'],
  ['ShuangDao', 'DualBlades'],
  ['MoDao', 'Modao'],
  ['HengDao', 'Hengdao'],
  ['QuanJia', 'Gauntlets'],
]);

function containsHan(s){
  return /[\u4e00-\u9fff]/.test(s);
}

function pascal(words){
  return words.filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function toPinyinPascal(han){
  const arr = pinyin(han, { toneType: 'none', type: 'array' }) || [];
  const words = arr.map(w => (w || '').replace(/[^a-zA-Z0-9]/g, '')).filter(Boolean);
  return pascal(words) || 'CN';
}

function translateStatKey(han){
  // Heuristic translation for stat-like phrases.
  // Examples:
  // MinOuterAttack -> MinOuterAttack
  // CritDamageBonus -> CritDamageBonus
  // SpecificMartialSkillDamageUp -> SpecificMartialSkillDamageUp
  let s = han;

  // Exact phrase mapping first.
  if (PHRASES.has(s)) return PHRASES.get(s);

  // Replace known multi-token phrases first.
  const multi = [
    ['BossDamageUp', 'BossDamageUp'],
    ['SpecificMartialSkillDamageUp', 'SpecificMartialSkillDamageUp'],
    ['SpecificMartialEffectiveness', 'SpecificMartialEffectiveness'],
    ['AllMartialEffectiveness', 'AllMartialEffectiveness'],
    ['SingleTargetArtDamageUp', 'SingleTargetArtDamageUp'],
    ['AoEArtDamageUp', 'AoEArtDamageUp'],
    ['CritDamageBonus', 'CritDamageBonus'],
    ['InsightDamageBonus', 'InsightDamageBonus'],
    ['OuterDamageBonus', 'OuterDamageBonus'],
    ['ElementalDamageBonus', 'ElementalDamageBonus'],
    ['OuterPenetration', 'OuterPenetration'],
    ['ElementalPenetration', 'ElementalPenetration'],
    ['DirectCritRate', 'DirectCritRate'],
    ['DirectInsightRate', 'DirectInsightRate'],
    ['AccuracyRate', 'AccuracyRate'],
    ['CritRate', 'CritRate'],
    ['InsightRate', 'InsightRate'],
    ['MinOuterAttack', 'MinOuterAttack'],
    ['MaxOuterAttack', 'MaxOuterAttack'],
    ['MinWuxiangAttack', 'MinWuxiangAttack'],
    ['MaxWuxiangAttack', 'MaxWuxiangAttack'],
  ];
  for (const [k,v] of multi){
    if (s === k) return v;
  }

  // Compose from tokens if possible.
  // Split into token matches by scanning longest first.
  const tokenKeys = Array.from(TOKENS.keys()).sort((a,b) => b.length - a.length);
  const out = [];
  while (s.length){
    let matched = false;
    for (const k of tokenKeys){
      if (s.startsWith(k)){
        out.push(TOKENS.get(k));
        s = s.slice(k.length);
        matched = true;
        break;
      }
    }
    if (!matched){
      // Fallback: pinyin for one char chunk to keep deterministic, but avoid infinite loop.
      const ch = s[0];
      if (/[\u4e00-\u9fff]/.test(ch)){
        out.push(toPinyinPascal(ch));
        s = s.slice(1);
      } else {
        // Non-han, keep alnum
        const m = s.match(/^[A-Za-z0-9_]+/);
        if (m){
          out.push(m[0]);
          s = s.slice(m[0].length);
        } else {
          s = s.slice(1);
        }
      }
    }
  }
  return out.join('');
}

function replaceHanSequences(text){
  // Replace contiguous Han sequences.
  return text.replace(/[\u4e00-\u9fff]+/g, (m) => {
    // Try phrase dictionary for exact match (UI strings).
    if (PHRASES.has(m)) return PHRASES.get(m);

    // If looks like a stat key / config key, translate heuristically.
    // We consider it "stat-like" if it contains these substrings.
    const statHints = ['Attack','Damage','Bonus','Penetration','Effectiveness','DamageUp','Crit','Insight','Accuracy','Outer','Elemental','Wuxiang','Strength','Agility','Momentum','Rate'];
    if (statHints.some(h => m.includes(h))){
      return translateStatKey(m);
    }

    // Fallback: pinyin PascalCase (removes Han from repo, deterministic).
    return toPinyinPascal(m);
  });
}

function walk(dir, cb){
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })){
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()){
      if (skipDirs.has(entry.name)) continue;
      walk(p, cb);
    } else cb(p);
  }
}

let touched = 0;
let changed = 0;

walk(ROOT, (file) => {
  const ext = path.extname(file);
  if (!exts.has(ext)) return;
  const base = path.basename(file);
  if (base === 'package-lock.json') return;

  let data;
  try { data = fs.readFileSync(file, 'utf8'); } catch { return; }
  if (!containsHan(data)) return;

  touched++;
  const out = replaceHanSequences(data);
  if (out !== data){
    fs.writeFileSync(file, out, 'utf8');
    changed++;
  }
});

console.log(JSON.stringify({ touched, changed }, null, 2));
