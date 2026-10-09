# Kiểm tra lộ IP công khai — vibecity.world

Ngày 09/10/2026. Chỉ đọc DNS, HTTP, Certificate Transparency và tài nguyên tĩnh; không quét cổng, dò subdomain hoặc tạo tải. Không truy cập dashboard Cloudflare/VPS.

Kết quả: chưa tìm thấy IP gốc trong phạm vi đã kiểm tra.

- DNS A: 172.67.165.14, 104.21.33.173; AAAA: 2606:4700:3037::ac43:a50e, 2606:4700:3035::6815:21ad. HTTP và WebSocket đều có Server: cloudflare, CF-Ray.
- Apex không trả MX, TXT hoặc CNAME trong truy vấn hiện tại. www không trả bản ghi A/AAAA/CNAME trong truy vấn hiện tại.
- HTML công khai và 32 bundle JS được HTML/bundle chính tham chiếu không có chuỗi IPv4 hợp lệ. URL game nhúng là wss://vibecity.world/ws. Các URL bên ngoài còn lại không phải URL backend IP.
- Không thấy sourceMappingURL trong 32 bundle đã đọc.
- Một handshake /ws trả 101 Switching Protocols qua Cloudflare. Không gửi hành động game.
- Certificate Transparency qua Cert Spotter trả *.vibecity.world và vibecity.world; không thu được subdomain cụ thể. crt.sh không cung cấp dữ liệu usable trong lần kiểm tra.
- Tìm kiếm công khai không trả kết quả cho domain trong lần kiểm tra; điều này không chứng minh lịch sử DNS không tồn tại.

Không kết luận về: lịch sử DNS đầy đủ, subdomain chưa được công bố, IPv6 origin chưa biết, dịch vụ khác trên VPS, firewall, WAF rules, IP/cổng có mở trực tiếp hay không. Cần đọc cấu hình VPS và Cloudflare để xác nhận phần này.

Các tài nguyên tham chiếu: https://vibecity.world/ ; https://api.certspotter.com/v1/issuances?domain=vibecity.world&include_subdomains=true&expand=dns_names
