(() => {
  const STORAGE_KEY = "beiaiAchievementsV1";
  const compactMode = document.documentElement.classList.contains("compact-pet")
    || document.documentElement.classList.contains("compact-slot");
  const tiers = ["初级", "中级", "高级"];
  const encryptedDefinitions = [
    [1,"初级","33siPQ3izeJWGsy7","QBx9Q8Xq30QaHtWmGRp3eqvZW5U1DkpGyho4u27sfTZuDSPUL8Odc5svh8M/XrKRezMKfJZ9NYA=","5MwSjHrt9XEEi+5xmEaVTSS1b7u1mLeUJ2t3w/BNvk4="],
    [2,"初级","8eh7vTERIXyxzqXP","q+Qza0bVH1EXWrd6eNg97A5A5kV9kV4iLedTbMweej6YKqeiTA2o//TUz6XoIYNhq/UR62SE8q2yQTVleug=","FejSG4xE2KotbNrJKEZNfwGb/ozCeGHdibvwYdr7pBQ="],
    [3,"初级","M3UXLWi4+OH0JAlX","94oNVCWMFFJ8xQD4zB+fJbKW2/PJZQtnacpGHCA1gkBHg4vm5eJOrbhRUoKlXmCUDouZHF3DwPW3yOhqdAzNTMYTQWZ/si1jma8=","n+soOM9OmOYqXFK0EZwwOfHPiVXd3AAiVPkdyWq4Wf0="],
    [4,"初级","+ThxPUFID54tJxyC","nG2FTaX6wKAqbzzJmZwKE43lEgdLs/ewjt8xcQgYVkDdzUF55brh6ljI8QGIYcOLrZvsNwrWwN9m6CNGvf4iIok=","zkLcNAHCOyp/9n30NSCmwUPmyGXYceyHxGyvBg0ddCE="],
    [5,"初级","B55kz8AVbSRotfCP","fVitOquaVymuwAGEsBnXdoU7gtsUhme460WE6kWlkJQfBo+6Q3TNoO85Fb/ESeI1JJe3I01BbmSjEpK8Lu3OxIgd","HjfRE8UvxOK6D86zrKOwM4jEOaB0DN7YGWcF0fRz/XE="],
    [6,"初级","l1207ihsCQU8yM2L","oPRD5+Xjryvp4z1WApGd8ZlQlOVCHVNqtVyyCHjeeX76IuPaA5rUSiWaOOroUt0uDfG7E2xo12U=","J4ediFz7HN6zvh1f8/XDTTNw2Tj53MLqnQVNBEpVlsc="],
    [7,"初级","+EqlRW1oyE5n/sC7","oaJ/5Z6Wij92AoqHLE47h+G49tlkE9woDH6h6APGqQTcb1RoEcN5+5cfLz82mlUV0or1hr0EoYeH3ozAhKnyTqEB2eS+ZZ5Y2cCkswbqq+4=","pcOyvNEUP9iAOA7+FoKpG4+wrsnqW1Wt8ae7NXi0pKE="],
    [8,"初级","/ly5Nv+CdBcguzXc","llARKvQVD7mdDwq+l0V/FLboPyBeHHWKdEkSOSZI1eI8g13JGmYm7fmlcLo0xu3O6sgV9u003GatEQE=","aFc2L+XDnsw7WYqeBAthA6nLYwgRV0+kBComkFe23sE="],
    [9,"初级","eoJN7krtrxey4xjS","0bFnIeM5XYB4TMKvBCSVFNA5xUXMtKCmGg4F3vLHEjdGLVWEMN8GD/xAiBB7iJiZcUP3epkocgtrwuRFjNpB","J13F/TXGYPNclQwbBtmhclVo1BfqgxI1uYtmD6XlO1M="],
    [10,"初级","q0pNF0lGLyI0VzE3","UETBRubGOB40ASZ6Cev+L3ZUIqecU4i5prY4t+bP8gBS6zYOnj7wyLsbGcaL33o+o+vzbFJHoLMmc0PVK1IaLqQ2L2BI6/xqXYzviWJge+wVFg88+kPv/k7MCnBEgAzQtvw=","Ty4jfISinrlDaPKdnuLC5ePMHcjWnUiiHhZpxJUarH8="],
    [11,"初级","6X8HHWlo7NB7AhQA","OQJndd/T3uEX0qaIks/rRnjFw4kcQeHLr7KNGQQeW0XeTFkqR0t3otlFVQVLjIy4CDveQlJGpj92rQeVAZSrtoLbYSJJla1F5PAHO98zfQmV9vBSqCxGdU+j8z1AZ7w+","vkNT4fMfBk1L1QEPEySjQRly6cCGR5DlFxns0LoGPKQ="],
    [12,"初级","HnB8b3RbANEjSAOX","5ZBSICnLaBxM3NTbxgJsedq3wCTYHyKgW/ZEt0a4YPgKAwOMEuXnRkeCI7/rAhdkGSUqMjAHhAIioRhjtOJRMxXYHqC3WdoGDjYwHOBAxNHZJBsCd46N0jd2yofZl1+Z+M8UOYa3GRs5","wASAeCHW9NymXOJDrr3GArKI9U2ztdj30BJYcb6LcFc="],
    [13,"初级","CukmnjCMmPFovgyW","fYxHe+GK/PgFM2fsE+irlqEcL3sKeAmSH9FqlHDY/7ERn9/AckRzHc14pCtkMYatLA7tXL1KhhQO0UruV8WGtBZoydE5BxBO4iyc6h1w+F7b","tgTCKVwiQ/2GLlwySjSfRiiaH7UP1pwVyw9sCZItZYs="],
    [14,"初级","OhVXoP2Ym22dxR8X","jpaZEEq/X/5Mf3nptbVJyEvjxzNpQ5k9TJeMfDqrvJ33g+VQ3OPq2v8oDa7UFM5xVBElpQlgxxA2Cp0rN4MTsy31SoWapTEyirMZ6OQXa3ds4AFfjbFkwE87TeQcbU2HrT0nA3+CJzOasCPXGpHjCCqDGi81K4Q=","ImFP5VopcsNhU/vRSFNG04R9HZKQNiAwM+96ICtML2Q="],
    [15,"初级","KJxY5B+7KIxCnKdJ","EEZDorHKzjcrnoxj3FbKYMpeH2zlcyO3CI26O2wlX0hfe7WAA7yz3cfnkDtTVuCe7wEgL4tCdyEkW5qwM1b7UjdhN1ozHXmZ","cuN5gMdX5xyxA7glQ51haNJEGlwXl4sR+jJcQsqXRik="],
    [16,"初级","dKgzSyIhetCVXcWq","VXgQwBDr8wOg3IpRmwSG44d/JFdTg2OYRgsqNJJxb9bW9pdpQEgByc3hrWrHivnVyTulDD2WIX4mJoACgFo+3QQek1fXOWcLxuhKI5IbSXbgiJy6kEgmaAlbl/0F","va0uDYd85YIOc+lEKT06iNKEsIbV0/xjC78S9yEttZY="],
    [17,"初级","dJ95WwvLm4YcBjft","p7Jn3Goa856UwOGURtCkFlU1DsY2B4z8QmYSht818vPzHrg/+iw+ER/hlafFrD4uY0JDPbJi5pP07fG/1LNGhA==","o6/1pX6uHSMZqniyes8C9q8KY7sBXUM8ZTvAcaWH56M="],
    [18,"初级","ZUEh2qB2uGDaXJ2R","YFDnVVZ5VYbv798YGqL9S17WvpJeeY2nPuw8d+t8gAuE6V3LszvqJF30ZBNTPfM6vIJoGt7U35M=","sLPSiPkioRpFHxEcxErRuzpUYXyLrWsdH8/QIZObn5U="],
    [19,"初级","zsiIszD+p55frsOo","SKAhWMBAsdPLKLME/vML+2YeXVjaWjHnIUwdoyUZf5VUnwwRAHD6uu6HVE0FPK0F2tLcFABA3rf4365HkZdAQYXAj6qm0RCHSB+//SzkcX3xSW3cIBXj75Wzc/fTTh2Uebg2dWrKjUSKSo9/dw==","jJsrEStNBg6d7O4X5RW/4zqbDbuznAW7II+R7F+CPmw="],
    [20,"初级","3thD6x02uR9EeUlF","ORGzUMiN7X94h5DYxpsZswy1BP1TyaJbwb7jIsrDUshD0EFp9aZej2NzG00TLPV5+XrB3LaLIdlBpdLLrYUYifQUeETQ226cS/FlwZbYFpoSh4FgLCg=","cZwTQpDgSpAhfxjfvqReSLrq7fUaziVLbOPf0XV/7F0="],
    [21,"初级","ZcBK4/hJmJyiabAt","+WTN5j4saPTbjFf3DSypaaEkwaSXmXjXZgXM44H8Pq3updG+u+ImP+HMM4E5dFYl5cYykG4dlpMGXeo36ZP+dTN5WMfYebMFZ4NkEhfTX3XK","065BPDUXZditbZf41pJ1JHHjgTe4Jm0zOMeb+ndEDzc="],
    [22,"初级","FfqZDaDYFMqblPnW","TG/Y9T88rc+tHhxlkqYcYzMdH3I56AtI1uj9iP0tB2jpqon2MbEC4wKxeQBmZJIlAHK53CSub9/DcGtjFsCwmqWjQKHiutg9SRaG/V0KortmjelmDA==","XuWMyKZ8lJmsNY2GG2D5/+bRN+zJhgbgf/2tr2DvZYM="],
    [23,"初级","hBY9TWitpnn/J/D0","FuODeX2qr2pVVHx/pBPPuqAIj1uflcN+y8+MdZ2jzqiRUBqPRpisRVS4rn9Q9H0e3lK7lNEJkc4xRT6cq/1HF/U=","rxagF/xWYaW/tqlcgusaOM9XmqmmxzOevZvJs9A/8DE="],
    [24,"初级","3cftqI2LMu54GXn+","AD3GhFvbOFE+fVpVQPLTcrdzCo10Didxd4b32qpNofV0xwgdqQbr3KnI/JbcvrFCBTnxhYeBxNcHwRl5Wzh8LbbsZlFd5kYOF0y7BX5J81ALBSF2Jpfpy6XBZGgAq+DJ0/8=","8hFQJSYSCqujOdrBEsqVXP8bIEZxSbP4f+8rKETOAq4="],
    [25,"初级","ywN5d9VcALEeo6Ok","w3acKA/yvRm8BTJyzD7jSq3sIXMbF15vo6dqfLzQJFqS9fHy06+22OZyROl987V6t7P2/K3ZwVtE4bEqHsyCG/d+kAyrwoISkdIFcP/5Mka+rtOz6kKpI82ArmQ8RhAzgIruBhzPl3c2Fcc=","G5rw1f7a8sy3bM7ib9cCbfZHj5OHFmMiQKfTSdilLsI="],
    [26,"初级","jGXEnGooNAzyZYhx","5x2UVl/MBY+wfigOsgl/B4j1BUBZ5IDZthQZlbSj//WlmOC9x5oxw6fAMiyduxvU+ddtfXZCZZy3jCk8B4Xbp6MaEdw6v7TiB5OfflLg7Ro1wHZoMHr3JM8zM0MhZChUHsVsFQ==","1NCpLTRBCjdQ0ZmTQU9XUPwbPSTsDLKDCQEVLLXSOHU="],
    [27,"初级","mZHn1fUVU0uXeMJK","sAWwcO065+zSaxM6qOGj6ACNHIdLwkxLb1To+tWKmmDQ2c8fs78lZHABxUVmGWdIIuIpZcnOb9Gpv00vsTIRCPd6UFSTx2WXOe1id37S6Y1MyA==","ij1iEbA50qMWQvH9iw2yPr+8SZVYxfrdWeTlDW3uNfg="],
    [28,"初级","UJcmZidnYdGHVxUD","yMzxv5Ibq6pat3QLAN6c3g8jKhQGA6XxvC0fwxPK1hWMExLNWGFPXH3wJgJ7cxkYxXmmlCFI/LWhFDuaRXd0xmgEYyeyq5zN7ARQHoxRGTmcevlpHW5rjFcGiPw=","+4QASEYl+PsVoj5TcNcpAfRkyLkZwgWiL/9KQvnSdDo="],
    [29,"初级","n8lCE5nhHL5xytHG","KjU/GeCwH00lgBNM9qDFl8KPB7fTE/2S+3lCxYkyXVJajNOlEOwXmo2xS68ouOk3HE+0hwqk/9oSpeO7SKQtv7uAI+iugZEfQ4E8xLtKgUOrPlDvXsqo/PbZ4Roy99eRcx0=","saSbHWOG06PJLQww6NFtTwM3Ino9pZNdRwPjOGEVD2g="],
    [30,"初级","2zi6NbU4xGdBKh/V","FpDmau3KDQ+E4354tTgVuMp0sn8XWZFtrrm/WjdImlhUx6BWdOgFiE2C0DCvbvthxRu2mxjGkGnqj3A+sEaTkn5F7glS+qyJRQ==","fi4NxylmPCx5AXck9lOsoByLKd1j0TOzHo6ZdO4ErcE="],
    [31,"初级","dbGT87EwpRu8lsHw","kIl4HGup7lbuGc7cNRlHWSHSww7ChZZfUUSsXSVcwJJ8816uXLwMI/LbTBPopJZ46NYuC5NgwEYc3fOurumL106eB2MacpJSsG/ItI4pQHhbg6ifH1bJgQmq5NErmg==","p8/WQbOVQiufGr+7uDPiT599HsF44kKM+q/yQrn3d9E="],
    [32,"初级","ME+invExLi1xzAN9","olMQl8BXU2mbnYYFcEf29u6MdQxKR3F1YnDGtFKGtylw20bv6yebk2MF5N00nKkUoG4MuKihcpCTWfvkGzzpE7tqgIWCoMcbBp9NAvXVg85kVqn08ouq+2X5IsxfaA==","BkEkgvfsI8qJ4QxQX+N/ZpJxg4MzoNkkMxg/dcJwETg="],
    [33,"初级","JJJ9Y2Lh1ndN1U5u","aYCIOIrjOk4515x83E6Qwp5w1T8YKioX4XtVk97KAh9fnk32pgs7o27eBTgVKLiE0xtIYeAG/W16RppPTWwY/NYBnBwgK6FlaBan1rxKNVGM2GFpRfLBDnJ5LOhHfNb0y8XwTIRV14zVzMvobvTR9KvO/N1slRuZYADTBDFm","pXMtcdaz3IyZJKbHdKCHuF8DroCmB3WFhSWXO4dUaf0="],
    [34,"初级","QO1GcRCBilv/R5Ec","aAqIy6/smeGrVsS3eMVkqgaI0XpcbDr+GC4kzE+IDONxu1UcNmrkRC+49y7Wq1adsFhM7bHXfIA0w+K7AuX4HKsAyB4S4gUjtMMAG2CDniNsOi44bfpAmEpugB/UHCITzLg=","zLt/wWJohagSTK/Y0lx9ZNjBZdRM1YShRhF95nHFoH0="],
    [35,"初级","VjmFES5tRB0E9LBC","S/X5HRznjJkYgv7LvV1p+EtjZ9tsAWN6ESLlFNmKK7iPecAbOUGmXnKwcve7KN/VJrKL6/JtRhR0Ny3B9JYiJfC15IfnRjK4ePupFOON3QdDZ3QM4QUkshaJhr6SXuVlppP0un1cbYlVOTkAz9Vll6QzJYU=","mXAR9cTAKuW9B+Mi7TzT7OVkPlcQ0D48CsB8rd+F4PY="],
    [36,"初级","PtsJ3hc+zgqx6FEN","ZbgAatmiCVQ4jWCRa527+w8aP4Vv01zjhmabcDzsu/C1mJgGGcfO/0cgHYZEnQF9tFzd1l1KB+qeoJROUzeYXpihg1JW0zwK6/xNyPeuWn5lcfe0Y3Y6","Vg9X6g+Z41xms+Wd636kmypRKt1nf91eu4QmdrBqUE8="],
    [37,"初级","f6rtaAgJqQyTxHdS","gGudA0Nrff5EOvHwpGePM9QUf9GTPXPtXQK2DxG7ZLnQXNoRV0JYh/Q1QHWVG7MB2tdqGqQtRBPoUEWDMhTLG0/axxV3bkcRasVUdpL2KaVICjd9bby2VSMOeN8HWWFQiDiIGfw=","RER72pQWWegrZGakNH3arqyLC7ctq+T9bqpPa9Mdy8g="],
    [38,"初级","TdqvvNQuQgKdai23","SK1W7uTeBd97rKHeNU1k/2j693ZPlPoJsmKT0oWbFs/gnruJUbX1pBh0lxgb8MYOw7YeHoCGf7kJ/5HpWcw9ulaaiEEmZjVAuog=","gp8fkqRWg7Mf339tsth6Kx+i5PlEeXkQE5/6jOTI7zA="],
    [39,"初级","NV58DPfhmdznONDv","N1eftU+418ban+oqeYFEeiHmmR+cmJyLDkLUbf+/iFUWr99pkg+G9bEmF27zDW6KzYKc+PbyDly1FFtT","Xl8mvet28YOAKbFdGwJ7O/3QRbAR5HQu5mG6bZkPClE="],
    [40,"初级","HQVK8JEMpw57oXAV","D5o8NHbWNzzVDEv0F58Gd72grFE4B9cTL9yAMKQ6MWToKFlkDiCDli0k9PgTEAsmsj9VHUJ10GoeuUEDdQ09mflgbzEzysNftoWOZN2/pi45//S+MdI=","wKbR3Up6KzLkXJQqv82mgMnmkhgI0lQg2cigtTD6Jow="],
    [41,"初级","cNe8vDKvCx04iDh3","DvqmUyLTHj6PdHhgy5py7Acispe+VsF1AANEI9c/XGMuyM4Wl3geaQp5Y6YH2G6QKl72ptAgijrUPTdqJWwYpInuRM1u8Pp1GCOO0Ud4btg=","9B+T3LP4Hco7k8n6MLMFcnrG34WM05J0tjO7n70WpyI="],
    [42,"初级","AQ9PeguU9L/Resfj","4rnDbo8qGM14gywbz7eHkOShek1FLaftR1ctNyHrkyH2iVCkiJB5x92nMm6d+228ldF4keUyr1N4usT7lvmHN2kmSosSX++TFQ98moxE+Uw=","QpvQoFwqF6vsuIgtWJoqw1xZCmYcjy9VK2JxUp2aisg="],
    [43,"初级","SWsmxUvTwMDe4ekR","+rYkXNtq9HODjEZrxwgvuntaIi4CWxB3uXjtIrghRzIl/kiNZZu58EdTKbHB2yqheP6b/B/cIBH7ZzqlIJ6N12Rktt7M1wvGJUPUcwgfzjs=","o0ejAnR++G9qoYx9q4b7ERFYBz5AXCwnxNTtHQKinKU="],
    [44,"初级","VSvoesN9a7wGxDu3","3i96try0n310oHz/LjEeKUoLqcEnogaHbLhCVxmTaTGtqpgshO4LK8PSqRN1nvqIj8bJCQxlmzdlLMfXChabb4cmFIctnW9Cl2yqr2ksUjc=","TWed6J43aktRGAXp+N4tdjjnlxsOLTPIi3q9k5hAnFc="],
    [45,"初级","yAyOineaXoAPmaqh","VRN5BwupPkYE/TY78YxSlVbcMRD3j/Dnrjm7Yk/pWlQqTQ2SLWTyKT7/J0wvZlA9sNjyvEwIylLmx1NlBjaNXSRpEbmJ6SbSk7v9rJhp0cLfY59HECuTE7ShbWtrZvE=","fBtziISgrYKeYqT6K3ETbc1m/1hvyfQ4jMrbg4aZFvw="],
    [46,"初级","D9qwDKqn+0Ej4UE9","wQsPt1r/4b6tKKRyjtr7G/MY6koAM0ytjc406ERRqK4Eii7+6yvAAW5HdarghV2lQDujZQPNipWROb5DmAu2Ng7PM1Xj3A==","Az667qEEfGAM+uJsea5AMXQLNkp++ojNytKf5YyPsoc="],
    [47,"初级","kYrJMFi/KKUmGlit","zdDLK8eyLlH/pkgRVWSKWO9pgLtnwUtyRmxw+inAoPpJUb/uk5MpJ4Q45ty3wm5TktIjq/1+9GzxQ9wBJ/hc3jr62wP5REfEhg==","QrSgp2+ZoMtFWDt+3X6pmfqrxfdRUAzK6wsiWai+Vgo="],
    [48,"初级","wh/6UHhIzhZFtlAV","qzjeunBsuPEzm5rjuL97L93Z+Uctcd5Sd2jF2zBqB2Ow3oKz7Pv38xlq/lrZex4stPaIk8Rbi0NQu0c0qmTWoc9jClEGi/arRnheJz6rv+xC3J/omFKvqN10lz+B1zWAvks1KlE=","BAF2zCi83g8bBA+gmGVCYmqAsdzAEMMC8J9Q13iIBxE="],
    [49,"中级","TF2rmLfsppGzEcol","HjDPJOXdKHp09FUX7Pb+SlEMg0ShroS9pft7IfHg4nMYsPp81r0McjniOY4X/1R5KLhm9Qrd1HM=","uSMDIRkY/1QSLsGpajYcXyzcr8l/00WmMYq7uZBCSCI="],
    [50,"中级","Bmirdc8mtl3EpeSv","jBfJp5BM/aiZwYvMR3OknsQfOG8/5XhN7GYORYC/pfN2KSBWQ1kv+zd11x40N/anQ4Ffb9pHkWZk9qM5/Qbjq/8=","QF6A5Ptg1buv57t6w+9Vua/hk263whrNdl96aUMTbF0="],
    [51,"中级","zKoFrbkbEBzR5Bq8","hh1AzmF0Kz3eeZiaw9thTD1Sfhs8DXNmAt2/89E2iduYerYbrK7G1+Y5AIt6TM7BCcI5QBmuLJEs2JYPdiaHsOVjpXQ=","MLLi0ue89gBNu71zsXNBYrmbrTdjV2mpgFHHHh9sJ+c="],
    [52,"中级","ctKXJDrwQlUWpYcB","jKLRe399/2EkC2erEsSQq2USVIHF/TaSvPPq0rbVS1UTGINNyFVSFEhiIWDrcrhU9Q8nJJCzydNwHqF4Ntc=","YqEWK8O5hSGoq+SZrm+WBujgyEKC65bMjqhmG65dR0I="],
    [53,"中级","KP5xHMtb7qcu12KP","Hq0kcC1D99K6SYleT4EHhsuOjcjAT5n7FmvyMarXFSDoxHhBUwY3q2b9VamZEzccQ4oQnOA=","xQbopwyfvKLZoIYs8QTqjQaC+12d8fCyYqZ46qVmyM4="],
    [54,"中级","RWEn0aXqCiffcgdQ","lxSrJeLdKmpwrHiAkUiw8YxzS6dYRgbr9kSs8cVQjgHFvQwKQXXmE1QTL5zVlESAKw==","SzZnYm193BrsBI7l40PPeT/nPBw6xhHsE6vje1hZeZ4="],
    [55,"中级","TFWgBGGVR9DU6Jk2","fTqfzANzoEm5PZdmcSCXdlGzdYjdk/XbgrP2u5Q0du79XDvP/xHLfqEeZm53oKQ5KmIjPph4EMliwopPf/O41VA=","PWDdzq0XsrHziiIyCd8U1MtW+7i7YPINsl7ZGzinaC8="],
    [56,"中级","Aa2ocAxyAehjtsTz","DF46IDYmirtEBxikM9BVnnGxsPa/CUa2AM0/NhpAn2FeynEwafEBDvN6cg3CLDqvqts5wjT26XCyfJfG6sc=","Y60aALNfpw6t2KU0kmidxftO+V72OJRLoaLFEBpkB+o="],
    [57,"中级","04xIfNukHnrcenPt","pGhrmTSZZpDMTgQNDsWMBY6yXJfCD7P6iYjTRIY18rAjQos5TI7r4Ck2eFRM1M53PSIaWG8eReSnSGwu+jjh8eA=","DgddaoJXYCEz1zDhRdUeDoFQf9ZhYuzk8eaDiuybmFs="],
    [58,"中级","IJGh3wHNI3b7aj8D","k8AhWAg9i3aqxufl8MqobHmJijiP7SP76LcUlgBBKt4wicbDMUnZX/WZoC9WkeAtUy84NfKaT3la/V26998=","zBexpUjrFaWP8bF50V3y8pMUuwA4HVVtSc23GJver4o="],
    [59,"中级","x76GZ8trRYXpt1G6","qq+GlwSruHL7K/cZj214Hy30c+Fvzh0ufUwQwhSTOXV67mcnwA0TN3G4qbNCTF2Gpzj3jNAv00T+OT16uqhv9g1ty8UBkqvPQsPNNESAKGdX8zKbk7XPXdNai0bkxzRruHTpSQg=","aOA7MdVyAo3ymxCs7uyq4yCPQFgYpVVDygTVR93TBYw="],
    [60,"中级","VVfpN7fLP0OId9WI","wF4E6JzZ59mW4SbNAsz+4I3oEWOnbPDPpbuzM/t+JM5R3pDKXEaD1mnCnLuy/Ko1tt+FUIykU3FjUHku2jUQuzODTl8GhQbrLnsUaoCckD8NsQOo2ZMpnVvcxCfuO25CXnXuNRtx26Gyq8Jy+hFMTxh2M6Vn5bkGAdo=","JV7ZZqo43hhuqgyzKc0JDWCT5O0HkbLMDTofv3C74Wg="],
    [61,"中级","52Mc3IcdTycY51RR","93q+eblcn3POxb39iQf43xXI/fu3Ob/PZPJWXD51mNUT07WQDkcuHwy8bjf+AYRaIXg1Rc4LLWpyGu3GahFbDWY=","3pbP1kyljzZqqwRAqqhNZgGY7EeopbPVYkXHtOCqoBY="],
    [62,"高级","tSLAxuUpLS1+iEoG","XGkgGvF869+kmYWSmmkEpMbsJrmxMCKF3viWid67q2u+6LpYSUzQUj5G1yioyUQ8jSowvoIdcbe/2m/U05Yf2CA=","RQHKrr7/JGuexb/GLLB/kKamkuUJ2qviiayqaT/ByuI="],
    [63,"高级","4nNSlNbd9NyX1a2m","i1XunThW9oXCIlxnzP5J4agkIi3cCVVbG6RSLUyfxvkQdZgSO4LSKWxlyIby6bHU099QPuN1bvprT68n9X0b6tF5/mQ=","NHFoJdw44soM2Th0FlSnwVneQIFIQREMC5OyqyYqo5U="],
    [64,"高级","Yacmv2iobOZ6kRc8","GXBVo35b0Cy0wM9xKxFB4p8QpOHRaY4Olzt4UpS/muoIG7IHCTdj0orGTaBMrrY=","IKPk/dkBVNivZ2eOxj/3Qr+wG5tMDqMbV0rLXbsm96M="],
    [65,"高级","ICqVLU7lg+7o/RVJ","7/EkR5qm4hllRDRf5lFrN42Fkvk4cZZNX1UXtggKds+6UQ+VC0J9PeSc2HJs7011wxxZXjXKjcA=","ooRbz+OPXe3yRfOEy5JdRndamwlWKznGkZzXYJOisnA="],
    [66,"高级","hG1Eyo9A9olnvTi4","Sij4aQH5bjRFPDTpj3Jl077Sxfq5aRdcppo+lsXnvU4Erwqn5QqLQOvMvBlwysT2AydWxQhxlvY2rL56M5SCti06CC8=","zhHU68lERRgasYozE00cpQaFoqL3bAZhtYlQoAewJeY="],
    [67,"高级","85XrPEt7LO7NPXRB","JRccF9TW3TNJ7OVNdjs7IhgFiQErDNPICyNZu0tYiMntgEqHW+g/1d4OP6zu/+M2e9u0frMRRxnB3OKAAtmoe2NZgWjKKVwc1DeqT4W+2Nc=","nedmh99nsTz8SbXXAKSToM3AITeeoSti/FHtp8CjbtE="]
  ].map(([id, tier, iv, ciphertext, key]) => ({ id, tier, iv, ciphertext, key }));
  const encryptedDefinitionById = new Map(encryptedDefinitions.map((item) => [item.id, item]));
  const decryptedDefinitionCache = new Map();
  const pendingUnlocks = new Set();
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  let wallRenderVersion = 0;

  const musicAchievementIds = [
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 47, 28, 29,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 48, 43, 44, 45, 46
  ];
  function freshState() {
    return {
      unlocked: {},
      musicSeconds: {},
      cleanTracks: {},
      rewardSeconds: 0
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return freshState();
      return {
        ...freshState(),
        ...saved,
        unlocked: saved.unlocked && typeof saved.unlocked === "object" ? saved.unlocked : {},
        musicSeconds: saved.musicSeconds && typeof saved.musicSeconds === "object" ? saved.musicSeconds : {},
        cleanTracks: saved.cleanTracks && typeof saved.cleanTracks === "object" ? saved.cleanTracks : {}
      };
    } catch (error) {
      return freshState();
    }
  }

  let state = loadState();
  let rewardSaveCounter = 0;

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Achievements still work for the current page when storage is unavailable.
    }
  }

  function pageName() {
    const name = window.location.pathname.split("/").pop();
    return (name || "index.html").toLowerCase();
  }

  function requestParentUnlock(id) {
    if (!compactMode || window.parent === window) return false;

    try {
      const parentApi = window.parent.BEIAI_ACHIEVEMENTS;
      if (typeof parentApi?.unlock === "function") {
        parentApi.unlock(id);
        return true;
      }
    } catch (error) {
      // Local file previews can give iframe documents opaque origins.
    }

    try {
      const targetOrigin = window.location.origin === "null" ? "*" : window.location.origin;
      window.parent.postMessage({ type: "beiai:achievement-unlock", id }, targetOrigin);
    } catch (error) {
      // Fall through and save the achievement inside the iframe itself.
    }
    return false;
  }

  function base64ToBytes(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  }

  async function decryptDefinition(id) {
    const numericId = Number(id);
    if (decryptedDefinitionCache.has(numericId)) return decryptedDefinitionCache.get(numericId);
    const encrypted = encryptedDefinitionById.get(numericId);
    if (!encrypted || !globalThis.crypto?.subtle) throw new Error("ACHIEVEMENT DECRYPTION UNAVAILABLE");

    const key = await crypto.subtle.importKey(
      "raw",
      base64ToBytes(encrypted.key),
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64ToBytes(encrypted.iv),
        additionalData: textEncoder.encode(`beiai-achievement:${numericId}:v1`)
      },
      key,
      base64ToBytes(encrypted.ciphertext)
    );
    const [title, description] = JSON.parse(textDecoder.decode(plaintext));
    if (typeof title !== "string" || typeof description !== "string") {
      throw new Error("INVALID ACHIEVEMENT ARCHIVE");
    }

    const definition = Object.freeze({
      id: numericId,
      tier: encrypted.tier,
      title,
      description
    });
    decryptedDefinitionCache.set(numericId, definition);
    return definition;
  }

  function toastAchievement(definition) {
    if (!document.body || document.documentElement.classList.contains("devtools-locked")) return;
    let region = document.getElementById("achievementToastRegion");
    if (!region) {
      region = document.createElement("div");
      region.id = "achievementToastRegion";
      region.className = "achievement-toast-region";
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-label", "成就解锁通知");
      document.body.appendChild(region);
    }

    const toast = document.createElement("section");
    toast.className = "achievement-toast";
    toast.innerHTML = `
      <div class="achievement-toast-bar">ACHIEVEMENT UNLOCKED // ${String(definition.id).padStart(2, "0")}</div>
      <div class="achievement-toast-body">
        <span aria-hidden="true">★</span>
        <div><strong></strong><p></p></div>
      </div>
    `;
    toast.querySelector("strong").textContent = definition.title;
    toast.querySelector("p").textContent = definition.description;
    region.prepend(toast);
    window.setTimeout(() => toast.classList.add("achievement-toast-out"), 4400);
    window.setTimeout(() => toast.remove(), 5000);
  }

  async function unlock(id, options = {}) {
    const numericId = Number(id);
    if (!encryptedDefinitionById.has(numericId)) return false;
    if (requestParentUnlock(numericId)) return true;
    if (state.unlocked[numericId]) return false;
    if (pendingUnlocks.has(numericId)) return false;

    pendingUnlocks.add(numericId);
    let definition;
    try {
      definition = await decryptDefinition(numericId);
    } catch (error) {
      return false;
    } finally {
      pendingUnlocks.delete(numericId);
    }

    state.unlocked[numericId] = new Date().toISOString();
    saveState();
    if (!options.silent) toastAchievement(definition);
    renderWall();
    return true;
  }

  function recordDiary(type, details = {}) {
    if (type === "solved") unlock(53);
    if (type === "destroyed") unlock(54);
    if (type === "destroyed" && details.allDestroyed) unlock(64);
    if (type === "solved" && details.allSolved) unlock(details.hadMistake ? 66 : 65);
  }

  function garble(seed, length) {
    const pool = "锟斤拷烫屯汞咣铪钴铯蜿縺譁亂碼▓▒░◆◇◎※�#@%&?!";
    let value = 2166136261 ^ Number(seed);
    let output = "";
    for (let index = 0; index < length; index += 1) {
      value = Math.imul(value ^ (index + 1), 16777619) >>> 0;
      output += pool[value % pool.length];
    }
    return output;
  }

  function formatUnlockedAt(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "UNLOCKED";
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
    }).format(date);
  }

  async function renderWall() {
    const wall = document.querySelector("[data-achievement-wall]");
    if (!wall) return;
    const currentRender = ++wallRenderVersion;
    const unlockedDefinitions = new Map();
    await Promise.all(encryptedDefinitions.map(async (item) => {
      if (!state.unlocked[item.id]) return;
      try {
        unlockedDefinitions.set(item.id, await decryptDefinition(item.id));
      } catch (error) {
        // Keep the record sealed if this browser cannot decrypt it.
      }
    }));
    if (currentRender !== wallRenderVersion) return;

    const unlockedCount = encryptedDefinitions.filter((item) => state.unlocked[item.id]).length;
    const count = document.querySelector("[data-achievement-count]");
    if (count) count.textContent = `${unlockedCount} / ${encryptedDefinitions.length}`;

    const fragment = document.createDocumentFragment();
    tiers.forEach((tier) => {
      const section = document.createElement("section");
      const heading = document.createElement("h2");
      const grid = document.createElement("div");
      heading.className = "achievement-tier-title";
      heading.textContent = `${tier}成就`;
      grid.className = "achievement-grid";

      encryptedDefinitions.filter((item) => item.tier === tier).forEach((item) => {
        const unlockedAt = state.unlocked[item.id];
        const definition = unlockedDefinitions.get(item.id);
        const card = document.createElement("article");
        card.className = `achievement-card ${definition ? "is-unlocked" : "is-locked"}`;
        const title = definition ? definition.title : garble(item.id, 14);
        const description = definition ? definition.description : garble(item.id * 17, 26);
        card.innerHTML = `
          <div class="achievement-card-head">
            <span>ACH-${String(item.id).padStart(2, "0")}</span>
            <span>${definition ? "UNLOCKED" : "SEALED"}</span>
          </div>
          <div class="achievement-card-body">
            <span class="achievement-medal" aria-hidden="true">${definition ? "★" : "?"}</span>
            <div><h3></h3><p></p><small></small></div>
          </div>
        `;
        card.querySelector("h3").textContent = title;
        card.querySelector("p").textContent = description;
        card.querySelector("small").textContent = definition
          ? `解锁时间：${formatUnlockedAt(unlockedAt)}`
          : "ARCHIVE DATA ENCRYPTED";
        grid.appendChild(card);
      });
      section.append(heading, grid);
      fragment.appendChild(section);
    });
    wall.replaceChildren(fragment);
  }

  function trackKey(track) {
    return track?.src || track?.title || "";
  }

  function getTrackForAudio(audio) {
    const tracks = Array.isArray(window.BEIAI_MUSIC_TRACKS) ? window.BEIAI_MUSIC_TRACKS : [];
    const source = audio.currentSrc || audio.getAttribute("src") || "";
    if (!source) return null;
    let absoluteSource = source;
    try {
      absoluteSource = new URL(source, window.location.href).href;
    } catch (error) {
      // Keep the original source for browsers with unusual local-file URLs.
    }
    const index = tracks.findIndex((track) => {
      try {
        return new URL(track.src, window.location.href).href === absoluteSource;
      } catch (error) {
        return source.endsWith(track.src);
      }
    });
    return index >= 0 ? { track: tracks[index], index } : null;
  }

  const audioSessions = new WeakMap();
  const watchedAudio = new WeakSet();

  function sessionFor(audio, resetAtBeginning = false) {
    const matched = getTrackForAudio(audio);
    if (!matched) return null;
    const key = trackKey(matched.track);
    let session = audioSessions.get(audio);
    if (!session || session.key !== key) {
      session = {
        key,
        index: matched.index,
        lastTime: Number(audio.currentTime) || 0,
        furthest: Number(audio.currentTime) || 0,
        startedAtBeginning: (Number(audio.currentTime) || 0) <= 1,
        dirty: false,
        lastSavedSecond: Math.floor(Number(state.musicSeconds[key]) || 0)
      };
      audioSessions.set(audio, session);
    } else if (resetAtBeginning && (Number(audio.currentTime) || 0) <= 1) {
      session.lastTime = Number(audio.currentTime) || 0;
      session.furthest = session.lastTime;
      session.startedAtBeginning = true;
      session.dirty = false;
    }
    return session;
  }

  function markCurrentAudioDirty() {
    document.querySelectorAll("audio").forEach((audio) => {
      const session = sessionFor(audio);
      if (session) session.dirty = true;
    });
  }

  function recordCleanTrackEnd(audio) {
    const session = sessionFor(audio);
    if (!session || !session.startedAtBeginning || session.dirty) return;
    if (Number.isFinite(audio.duration) && session.furthest < audio.duration - 3) return;
    state.cleanTracks[session.key] = true;
    saveState();
    unlock(59);
    const tracks = Array.isArray(window.BEIAI_MUSIC_TRACKS) ? window.BEIAI_MUSIC_TRACKS : [];
    if (tracks.length && tracks.every((track) => state.cleanTracks[trackKey(track)])) unlock(62);
  }

  function watchAudio(audio) {
    if (!(audio instanceof HTMLAudioElement) || watchedAudio.has(audio)) return;
    watchedAudio.add(audio);

    audio.addEventListener("play", () => sessionFor(audio, true));
    audio.addEventListener("timeupdate", () => {
      if (audio.paused) return;
      const session = sessionFor(audio);
      if (!session) return;
      const currentTime = Number(audio.currentTime) || 0;
      const delta = currentTime - session.lastTime;
      session.lastTime = currentTime;
      session.furthest = Math.max(session.furthest, currentTime);
      if (delta <= 0 || delta > 2.5) return;

      const listened = Math.min(15, (Number(state.musicSeconds[session.key]) || 0) + delta);
      state.musicSeconds[session.key] = listened;
      const wholeSecond = Math.floor(listened);
      if (wholeSecond !== session.lastSavedSecond) {
        session.lastSavedSecond = wholeSecond;
        saveState();
      }
      if (listened >= 15) unlock(musicAchievementIds[session.index]);
    });
  }

  function watchExistingAndFutureAudio() {
    document.querySelectorAll("audio").forEach(watchAudio);
    const observer = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches("audio")) watchAudio(node);
        node.querySelectorAll?.("audio").forEach(watchAudio);
      }));
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function isDevtoolsShortcut(event) {
    const key = String(event.key || "").toLowerCase();
    const commandKey = event.ctrlKey || event.metaKey;
    return event.key === "F12"
      || (commandKey && event.shiftKey && ["i", "j", "c"].includes(key))
      || (commandKey && !event.shiftKey && ["u", "s"].includes(key));
  }

  function recordDevtoolsAttempt() {
    const page = pageName();
    if (["diary.html", "talk.html", "notice.html", "aichat.html"].includes(page)) unlock(60);
    if (page === "index.html") unlock(61);
  }

  function installGeneralListeners() {
    document.addEventListener("ended", (event) => {
      if (event.target instanceof HTMLAudioElement) recordCleanTrackEnd(event.target);
    }, true);

    document.addEventListener("click", (event) => {
      const link = event.target.closest?.("a[href]");
      if (link) {
        try {
          const target = new URL(link.href, window.location.href);
          if (["http:", "https:"].includes(target.protocol) && target.origin !== window.location.origin) unlock(58);
        } catch (error) {
          // Ignore malformed decorative links.
        }
      }
      if (event.target.closest?.("[data-lyric-index]")) markCurrentAudioDirty();
    }, true);

    document.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.matches("[data-seek], [data-global-seek]")) markCurrentAudioDirty();
      if (target.matches("[data-music-motion-strength]") && Number(target.value) >= Number(target.max)) unlock(51);
      if (target.matches("[data-volume], [data-global-volume]") && Number(target.value) >= Number(target.max)) unlock(57);
    }, true);

    document.addEventListener("keydown", (event) => {
      if (isDevtoolsShortcut(event)) recordDevtoolsAttempt();
    }, true);
    document.addEventListener("contextmenu", recordDevtoolsAttempt, true);

    window.addEventListener("beiai:pet-change", (event) => {
      if (event.detail?.type !== "consumed") return;
      unlock(49);
      if (event.detail.complete) unlock(56);
    });

    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin || event.data?.type !== "beiai:achievement-unlock") return;
      unlock(event.data.id);
    });

    window.addEventListener("storage", (event) => {
      if (event.key !== STORAGE_KEY) return;
      state = loadState();
      renderWall();
    });
  }

  function awardPageAchievements() {
    if (compactMode) return;
    unlock(1);
    const musicProgress = window.BEIAI_PET?.getMusicProgress?.();
    if (musicProgress?.consumed > 0) unlock(49);
    if (musicProgress?.complete) unlock(56);
    const page = pageName();
    if (page === "diary.html") unlock(3);
    if (page === "music.html") unlock(4);
    if (page === "notice.html") unlock(5);
    if (page === "aichat.html") unlock(6);
    if (page === "reward.html") unlock(55);
    if (page === "talk.html") {
      if (window.BEIAI_PET?.isTalkRestored()) unlock(63);
      else unlock(2);
    }
  }

  function startRewardTimer() {
    if (pageName() !== "reward.html" || state.unlocked[67]) return;
    window.setInterval(() => {
      if (document.hidden) return;
      state.rewardSeconds = Math.min(45, (Number(state.rewardSeconds) || 0) + 1);
      rewardSaveCounter += 1;
      if (rewardSaveCounter >= 5) {
        rewardSaveCounter = 0;
        saveState();
      }
      if (state.rewardSeconds >= 45) {
        saveState();
        unlock(67);
      }
    }, 1000);
  }

  window.BEIAI_ACHIEVEMENTS = Object.freeze({
    unlock,
    recordDiary,
    getState: () => JSON.parse(JSON.stringify(state))
  });

  installGeneralListeners();
  watchExistingAndFutureAudio();
  awardPageAchievements();
  startRewardTimer();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderWall, { once: true });
  else renderWall();
})();
