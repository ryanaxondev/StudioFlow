# Visual Test Assets

M03 establishes the directory convention only. Do not add visual regression baselines until real P0 Screens exist.

Future Playwright baselines use:

```text
tests/visual/baselines/<project>/<test-file>/<snapshot>.png
```

Failure-only screenshots remain generated artifacts under `test-results/` and are not committed.
