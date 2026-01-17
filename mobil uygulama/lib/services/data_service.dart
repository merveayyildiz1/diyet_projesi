import 'package:http/http.dart' as http;
import 'dart:convert'; // JSON formatı için

class DataService {

  // API adresimiz (.NET projemizin http portu ve /api/data rotası)
  // Lütfen "12346" portunun doğru olduğundan emin olun.
  // Chrome'da (localhost) test ettiğimiz için "localhost" kullanıyoruz.
  final String _baseUrl = "http://localhost:12346/api/data";

  Future<Object?>? get _appointmentsFuture => null;

  // --- Hata ayıklama için yardımcı metot ---
  String _getErrorMessage(String responseBody, int statusCode) {
    try {
      var error = jsonDecode(responseBody);
      return error['Message'] ?? 'Bilinmeyen bir sunucu hatası.';
    } catch (e) {
      print('!!! SUNUCU ÇÖKTÜ (JSON DÖNMEDİ) !!!');
      print('SUNUCU CEVABI (HTML): $responseBody');
      return 'Sunucu hatası (Kod: $statusCode). Lütfen .NET projenizi kontrol edin.';
    }
  }

  //=====================================================================
  // 1. YENİ KİLO GİRİŞİ EKLEME (danisan.dart bunu çağıracak)
  //=====================================================================
  Future<Map<String, dynamic>> addWeight(int userId, double weight) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/add-weight'), // API kapısı: api/data/add-weight
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'UserID': userId,
          'Weight': weight,
        }),
      );

      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'message': _getErrorMessage(response.body, response.statusCode)};
      }
    } catch (e) {
      print('AddWeight Hatası: $e');
      return {'success': false, 'message': 'Bağlantı hatası: $e'};
    }
  }

  //=====================================================================
  // 2. YENİ YEMEK GİRİŞİ EKLEME (danisan.dart bunu çağıracak)
  //=====================================================================
  Future<Map<String, dynamic>> addMeal({
    required int userId,
    required String foodName,

    required String mealType,
    required DateTime dateEaten,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/add-meal'), // API kapısı: api/data/add-meal
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'UserID': userId,
          'FoodName': foodName,
          'MealType': mealType,
          'DateEaten': dateEaten.toIso8601String(), // Tarihi .NET'in anlayacağı formata çevir
        }),
      );

      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'message': _getErrorMessage(response.body, response.statusCode)};
      }
    } catch (e) {
      print('AddMeal Hatası: $e');
      return {'success': false, 'message': 'Bağlantı hatası: $e'};
    }
  }

  Future<Map<String, dynamic>> getMealsForDay( int userId, DateTime date) async {
    try {
      final String isoDate= date.toIso8601String();
      final response = await http.get(
        Uri.parse('$_baseUrl/get-meals-for-day/$userId?date=$isoDate'), // API kapısı: api/data/meals-for-day/{userId}/{date}
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'success': false, 'message': _getErrorMessage(response.body, response.statusCode)};
      }
    } catch (e) {
      print('GetMealsForDay Hatası: $e');
      return {'success': false, 'message': 'Bağlantı hatası: $e'};
    }
  }

  Future<Map<String, dynamic>> addAppointment({
      required int clientUserId,
      required int dietitianUserId,
      required DateTime appointmentDate,
      required String notes,
    }) async {
      try {
        final response = await http.post(
          Uri.parse('$_baseUrl/add-appointment'), // API kapısı: api/data/add-appointment
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'ClientUserID': clientUserId,
            'DietitianUserID': dietitianUserId,
            'AppointmentDate': appointmentDate.toIso8601String(), //tarihi .net e göndermek için
            'Notes': notes,
          }),
        );

        if (response.statusCode == 200) {
          return {'success': true, 'data': jsonDecode(response.body)};
        } else {
          return {'success': false, 'message': _getErrorMessage(response.body, response.statusCode)};
        }
      } catch (e) {
        print('AddAppointment Hatası: $e');
        return {'success': false, 'message': 'Bağlantı hatası: $e'};
      }
    }
    Future<Map<String, dynamic>> getClientDetails(int userID) async {
      try {
        final response = await http.get(
          Uri.parse('$_baseUrl/client-details/$userID'), // API kapısı: api/data/get-client-details/{userID}
        );

        if (response.statusCode == 200) {
          return {'success': true, 'data': jsonDecode(response.body)};
        } else {
          return {'success': false, 'message': _getErrorMessage(response.body, response.statusCode)};
        }
      } catch (e) {
        print('GetClientDetails Hatası: $e');
        return {'success': false, 'message': 'Bağlantı hatası: $e'};
      }
    }

    Future<Map<String, dynamic>> getAppointmentDetails(int dietitianUserId) async {
      try {
        final response = await http.get(
          Uri.parse('$_baseUrl/appointments-for-dietitian/$dietitianUserId'),
          headers: {'Content-Type': 'application/json'},
        );

        if (response.statusCode == 200) {
          return jsonDecode(response.body);
        } else {
          return {'success': false, 'message': _getErrorMessage(response.body, response.statusCode)};
        }
      } catch (e) {
        print('GetAppointmentDetails Hatası: $e');
        return {'success': false, 'message': 'Bağlantı hatası: $e'};
      }

      
    }
    Future<Map<String, dynamic>> getAppointmentsForDietitian(int dietitianUserId) async {
      try {
        final response = await http.get(
          Uri.parse('$_baseUrl/appointments-for-dietitian/$dietitianUserId'),
          headers: {'Content-Type': 'application/json'},
        );

        if (response.statusCode == 200) {
         return jsonDecode(response.body);
        } else {
          return {'success': false, 'message': _getErrorMessage(response.body, response.statusCode)};
        }
      } catch (e) {
        print('GetAppointmentsForDietitian Hatası: $e');
        return {'success': false, 'message': 'Bağlantı hatası: $e'};
      }
    }
    Future<Map<String, dynamic>> updateAppointmentStatus({required int appointmentId, required String status}) 
    async {
      try {
        final response = await http.post(
          Uri.parse('$_baseUrl/update-appointment-status'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'AppointmentID': appointmentId,
            'NewStatus': status,
          }),
        );

        if (response.statusCode == 200) {
          return {'success': true, 'data': jsonDecode(response.body)};
        } else {
          return {'success': false, 'message': _getErrorMessage(response.body, response.statusCode)};
        }
      } catch (e) {
        print('UpdateAppointmentStatus Hatası: $e');
        return {'success': false, 'message': 'Bağlantı hatası: $e'};
      }
    }
    Future<Map<String, dynamic>> getAppointmentsForClient(int clientUserId) async {
      try {
        final response = await http.get(
          Uri.parse('$_baseUrl/appointments-for-clients/$clientUserId'),
        );

        if (response.statusCode == 200) {
          return jsonDecode(response.body);
        } else {
          return {'success': false, 'message': _getErrorMessage(response.body, response.statusCode)};
        }
      } catch (e) {
        print('GetAppointmentsForClients Hatası: $e');
        return {'success': false, 'message': 'Bağlantı hatası: $e'};
      }
    }

    Future<Map<String, dynamic>> getClientsForDietitian(int dietitianId)async{
      try {
        final response = await http.get(
          Uri.parse('$_baseUrl/clients-for-dietitian/$dietitianId'),
        );
        if (response.statusCode == 200) {
          return jsonDecode(response.body);
        } else {
          return {'success': false, 'message': _getErrorMessage(response.body, response.statusCode)};
        }
      } catch (e) {
        print('GetClientsForDietitian Hatası: $e');
        return {'success': false, 'message': 'Bağlantı hatası: $e'};
      }
    }

    Future<Map<String, dynamic>> getTodaysAppoinments(int dietitianId) async {
      try {
        final response = await http.get(
          Uri.parse('$_baseUrl/todays-appointments/$dietitianId'),
        );

        if (response.statusCode == 200) {
          return jsonDecode(response.body);
        } else {
          return {'success': false, 'message': _getErrorMessage(response.body, response.statusCode)};
        }
      } catch (e) {
        print('GetTodaysAppointments Hatası: $e');
        return {'success': false, 'message': 'Bağlantı hatası: $e'};
      }
    }
} 
