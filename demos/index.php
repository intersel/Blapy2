<?php
$dirs = array_filter(glob('*', GLOB_ONLYDIR), function ($d) {
    return file_exists("$d/index.php") || file_exists("$d/index.html");
});
sort($dirs);

function usesModernBuild(string $dir): bool
{
    foreach (['index.php', 'index.html', 'footer.php', 'header.php'] as $f) {
        if (is_file("$dir/$f") && str_contains((string) file_get_contents("$dir/$f"), 'blapy.umd.js')) {
            return true;
        }
    }
    return false;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blapy2 — Demos</title>
    <style>
        body { font-family: system-ui, Arial, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; color: #222; }
        h1 { text-align: center; }
        ul { list-style: none; padding: 0; }
        li { margin: 6px 0; padding: 12px 16px; background: #f6f6f6; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
        a { text-decoration: none; color: #2563eb; font-weight: 600; }
        a:hover { text-decoration: underline; }
        .tag { font-size: 12px; padding: 2px 8px; border-radius: 999px; }
        .modern { background: #dcfce7; color: #166534; }
        .legacy { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <h1>📂 Blapy2 — Demos</h1>
    <p>Clique sur une demo pour l'ouvrir. Le tag indique si elle utilise déjà le build moderne (<code>blapy.umd.js</code>).</p>
    <ul>
        <?php foreach ($dirs as $dir): ?>
            <li>
                <a href="<?= htmlspecialchars($dir) ?>/"><?= htmlspecialchars($dir) ?></a>
                <?php if (usesModernBuild($dir)): ?>
                    <span class="tag modern">migrée</span>
                <?php else: ?>
                    <span class="tag legacy">legacy</span>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
    </ul>
</body>
</html>