import 'package:http/http.dart' as http;
import 'dart:convert'; // JSON formatı için
// shared_preferences import'unu sildik

class AuthService {

  // LÜTFEN ADRESİ KONTROL EDİN
  // Eğer Chrome (Web) kullanıyorsanız "localhost"
  // Eğer Android Emülatör kullanıyorsanız "10.0.2.2"
  final String _baseUrl = "http://localhost:12346/api/auth"; 

  // --- Hata ayıklama için yardımcı metot ---
  String _getErrorMessage(String responseBody, int statusCode) {
    try {
      var error = jsonDecode(responseBody);
      return error['Message'] ?? 'Bilinmeyen bir sunucu hatası.';
    } catch (e) {
      return 'Sunucu hatası (Kod: $statusCode). Lütfen .NET projenizi kontrol edin.';
    }
  }

  // --- Login Metodu (Hafızaya kaydetme kısmı SİLİNDİ) ---
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/login'), 
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'Email': email,
          'Password': password,
        }),
      );

      if (response.statusCode == 200) {
        // Sadece sonucu döndür, kaydetme
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'message': _getErrorMessage(response.body, response.statusCode)};
      }
    } catch (e) {
      print('Login Hatası: $e');
      return {'success': false, 'message': 'Sunucuya bağlanılamadı: $e'};
    }
  }

  // --- registerClient metodu (Değişiklik yoktu) ---
  Future<Map<String, dynamic>> registerClient(String firstName, String lastName, String email, String password, String invitationCode) async {
    // ... (Bu metot sizde zaten vardı, aynı kalabilir)
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/register-client'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'FirstName': firstName,
          'LastName': lastName,
          'Email': email,
          'Password': password,
          'InvitationCode': invitationCode,
        }),
      );
      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        var error = jsonDecode(response.body);
        return {'success': false, 'message': error['Message'] ?? 'Kayıt başarısız.'};
      }
    } catch (e) {
      print('RegisterClient Hatası: $e');
      return {'success': false, 'message': 'Sunucuya bağlanılamadı: $e'};
    }
  }

  // --- registerDietitian metodu (Değişiklik yoktu) ---
   Future<Map<String, dynamic>> registerDietitian(String firstName, String lastName, String email, String password, String clinicName) async {
    // ... (Bu metot sizde zaten vardı, aynı kalabilir)
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/register-dietitian'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'FirstName': firstName,
          'LastName': lastName,
          'Email': email,
          'Password': password,
          'ClinicName': clinicName,
        }),
      );
      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        var error = jsonDecode(response.body);
        return {'success': false, 'message': error['Message'] ?? 'Kayıt başarısız.'};
      }
    } catch (e) {
      print('RegisterDietitian Hatası: $e');
      return {'success': false, 'message': 'Sunucuya bağlanılamadı: $e'};
    }
  }

  // checkLoginStatus ve logout metotlarını SİLDİK.
}