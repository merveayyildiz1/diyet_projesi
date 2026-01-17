
import 'package:flutter/material.dart';
import 'package:flutter_application_2/services/data_service.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:flutter_application_2/screens/client_meal_details_page.dart';

class DietitianHomePage extends StatefulWidget {

  final int userId;
  const DietitianHomePage({super.key, required this.userId});

  @override
  State<DietitianHomePage> createState() => _DietitianHomePageState();
}

class _DietitianHomePageState extends State<DietitianHomePage> {
  int _selectedIndex = 0; // Hangi sekme seçili

  final DataService _dataService = DataService();

  late Future<Map<String, dynamic>> _appointmentsFuture;
  late Future<Map<String, dynamic>> _clientsFuture;
  late Future<Map<String, dynamic>> _todaysAppointmentsFuture;

  @override
  void initState() {
    super.initState();
    initializeDateFormatting('tr_TR', null);
    _loadAppointments();
   _appointmentsFuture = _dataService.getAppointmentDetails(widget.userId);
   _clientsFuture = _dataService.getClientsForDietitian(widget.userId);
   _todaysAppointmentsFuture = _dataService.getTodaysAppoinments(widget.userId);
  }
  void _loadAppointments() {
    setState(() {
      _appointmentsFuture = _dataService.getAppointmentDetails(widget.userId);
      _todaysAppointmentsFuture = _dataService.getTodaysAppoinments(widget.userId);
    });
  }

  void _loadClients(){
    setState(() {
      _clientsFuture = _dataService.getClientsForDietitian(widget.userId);
      
    });
  }

Future<void> _handleAppointmentUpdate(int appointmentId, String newStatus) async {
    final result = await _dataService.updateAppointmentStatus(
      appointmentId: appointmentId,
      status: newStatus,
    );

    if (mounted) {
      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Randevu durumu başarıyla güncellendi.'),
          backgroundColor: Colors.green,
          ),
        );
        _loadAppointments(); // Randevuları yeniden yükle
      } else {
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hata: ${result['message']}'),
          backgroundColor: Colors.red),
        );
      }
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  Widget _getPage(int index) {
    switch (index) {
      case 0:
        return _buildHomePage1(); // Ana Sayfa
      case 1:
        return _buildClientPage1(); // Danışanlar
      case 2:
        return _buildAppointmentPage1(); // Sohbet
      case 3:
        return _buildChatPage1(); // Randevu
      default:
        return _buildHomePage1();
    }
  }

// 1) ANA SAYFA
  Widget _buildHomePage1() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [ 
          FutureBuilder<Map<String, dynamic>>(
            future: _clientsFuture,
            builder: (context, snapshot) { 
              String clientCount;

              if(snapshot.connectionState == ConnectionState.waiting) {
                clientCount = '...'; // Yükleniyor durumu
              } else if (!snapshot.hasData || snapshot.data!['success'] == false) {
                clientCount = 'Hata'; // Hata durumu
              } else {
                final List clients = snapshot.data!['data'];
                clientCount = clients.length.toString();
              }
              return Card(
                elevation: 3,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                color: const Color.fromARGB(255, 193, 211, 165),
                child: ListTile(
                  leading: const Icon(Icons.person, size: 50),
                  title: const Text(
                    'Aktif Danışan Sayısı',
                  ),
                  subtitle: Text(
                    clientCount,  
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              );
            }
              ),
          const SizedBox(height: 16),
           FutureBuilder(
            future: _todaysAppointmentsFuture,
            builder: (context, snapshot) {
              String appointmentCount;

              if(snapshot.connectionState == ConnectionState.waiting) {
                appointmentCount = '...'; // Yükleniyor durumu
              } else if (!snapshot.hasData || snapshot.data!['success'] == false) {
                appointmentCount = 'Hata'; // Hata durumu
              } else {
                final List appointments = snapshot.data!['data'];
                appointmentCount = appointments.length.toString();
              }
              return Card(
                elevation: 3,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                color: const Color.fromARGB(255, 193, 211, 165),
                child: ListTile(
                  leading: const Icon(Icons.calendar_today, size: 50),
                  title: const Text(
                    'Bugünkü Randevular',
                  ),
                  subtitle: Text(
                    appointmentCount,  
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              );
            },
           )
        ],
      ),
    );
  }

  Widget _buildClientPage1() {
    return FutureBuilder<Map<String, dynamic>>(
      future: _clientsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        }

        if (!snapshot.hasData || snapshot.data!['success'] == false) {
          String errorMessage = snapshot.data?['message'] ?? "Danışanlar çekilemedi.";
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Hata: $errorMessage',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.red, fontSize: 16),
              ),
            ),
          );
        }

        final List clients = snapshot.data!['data'];

        if (clients.isEmpty) {
          return Center(
            child: Text(
              'Henüz danışanınız yok.',
              style: TextStyle(fontSize: 18, color: Colors.grey.shade600),
            ),
          );
        }
         return ListView.builder(
          itemCount: clients.length,
          itemBuilder: (context, index) {
            final client = clients[index];
            final String clientName = client['ClientName'] ?? 'İsim Yok';
            final int clientUserId = client['UserID'];

            return ListTile(
              leading: CircleAvatar(
                backgroundColor: const Color.fromARGB(255, 125, 153, 92),
                child: Text(
                  clientName.substring(0, 1),
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
              title: Text(
                clientName,
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Text('Danışan (ID: $clientUserId)'),
              trailing: Icon(Icons.arrow_forward_ios),
              onTap: () {
                // TIKLANDIĞINDA YENİ SAYFAYA YÖNLENDİR (Adım 4)
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ClientMealDetailsPage(
                      clientUserId: clientUserId,
                      clientName: clientName,
                    ),
                  ),
                );
              },
            );
          },
        );
       
      },
    );
  }
   
  Widget _buildAppointmentPage1(){
    return FutureBuilder(
      // 1. "Asistan"ı çağırıp "bana gelen randevuları ver" diyoruz
      // "widget.userId" sayesinde hangi diyetisyen olduğunu biliyoruz
      future:_appointmentsFuture,
      builder: (context, snapshot) {

        // --- DURUM 1: Veri henüz yükleniyor ---
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        }

        // --- DURUM 2: API'den bir hata geldi ---
        if (!snapshot.hasData || snapshot.data!['success'] == false) {
          String errorMessage = snapshot.data?['message'] ?? "Randevular çekilemedi.";
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Hata: $errorMessage',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.red, fontSize: 16),
              ),
            ),
          );
        }

        // --- DURUM 3: Başarılı! Veri geldi ---
        final List appointments = snapshot.data!['data'];

        // --- DURUM 3A: Hiç randevu talebi yok ---
        if (appointments.isEmpty) {
          return Center(
            child: Text(
              'Bekleyen yeni randevu talebi bulunmuyor.',
              style: TextStyle(fontSize: 18, color: Colors.grey.shade600),
            ),
          );
        }

        // --- DURUM 3B: Randevu talepleri var! Listeyi göster ---
        return ListView.builder(
          itemCount: appointments.length,
          itemBuilder: (context, index) {
            final appointment = appointments[index];
            
            // Tarihi formatla (.NET'ten gelen tarihi Dart'a çevir)
            final DateTime appDate = DateTime.parse(appointment['AppointmentDate']);
            final String formattedDate = DateFormat('dd MMMM yyyy - HH:mm').format(appDate);

            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              elevation: 3,
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: const Color.fromARGB(255, 125, 153, 92),
                  child: Text(
                    appointment['ClientName'].substring(0, 1), // Danışanın baş harfi
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                title: Text(
                  appointment['ClientName'], // Danışanın Adı
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text(
                  'Tarih: $formattedDate\nNot: ${appointment['Notes']}',
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: Icon(Icons.check, color: Colors.green),
                      onPressed: () {
                        _handleAppointmentUpdate(appointment['AppointmentID'], 'Onaylandı');   
                      },
                    ),
                    IconButton(
                      icon: Icon(Icons.close, color: Colors.red),
                      onPressed: () {
                        
                        _handleAppointmentUpdate(appointment['AppointmentID'], 'Reddedildi');
                      },
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildChatPage1() {
    return Text(
      'Sohbet Sayfası - Yakında eklenecek özellikler var!'
    );
  }
        

   
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 125, 153, 92),
        elevation: 0,
        title: Text(
        _selectedIndex == 0
      ? 'Ana Sayfa'
      : _selectedIndex == 1
          ? 'Danışanlar'
      : _selectedIndex == 2
              ? 'Sohbet'
              :'Randevular'
         
        ),
      ),
      body: _getPage(_selectedIndex), // Seçili sayfayı göster

      // ALT NAVİGASYON BAR
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[

          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Ana Sayfa',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Danışanlar', 
          ), 
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'Randevular',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat),
            label: 'Sohbet',
          ),
          
         
        ],
        currentIndex: _selectedIndex,
        backgroundColor: const Color.fromARGB(255, 193, 211, 165),
        selectedItemColor: const Color.fromARGB(255, 0, 0, 0),
        unselectedItemColor: const Color.fromARGB(255, 73, 72, 72),
        onTap: _onItemTapped,
      ),
    );
  }
}






